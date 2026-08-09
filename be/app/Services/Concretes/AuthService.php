<?php

namespace App\Services\Concretes;

use App\Http\Resources\Api\User\UserResource;
use App\Models\User;
use App\Repositories\User\Contracts\UserRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\AuthServiceInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;

class AuthService extends BaseService implements AuthServiceInterface
{
    /**
     * UserService constructor.
     */
    public function __construct(protected UserRepositoryInterface $userRepository)
    {
        $this->setRepository($userRepository);
    }

    /**
     * Register a new user.
     *
     * @param  array<string, mixed>  $data
     */
    public function register(array $data): array
    {
        /** @var User $user */
        $user = $this->repository->create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
        ]);
        $user->assignRole('client');
        $user->sendEmailVerificationNotification();
        return $this->prepareUserWithToken($user);
    }

    /**
     * Authenticate a user.
     *
     * @param  array<string, mixed>  $credentials
     *
     * @throws AuthenticationException If authentication fails
     */
    public function login(array $credentials): array
    {
        if (! $token = auth()->attempt($credentials)) {
            throw new AuthenticationException('Invalid credentials');
        }

        /** @var User $user */
        $user = Auth::user();

        if (! $user->is_active) {
            auth()->logout();
            throw new AuthenticationException('Your account is inactive');
        }

        return $this->prepareUserWithToken($user, $token);
    }

    public function forgot($email): string
    {
        return  Password::sendResetLink(
            $email
        );
    }

    public function resetPassword(array $data): string
    {
        return Password::reset(
            $data,
            function ($user, $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'remember_token' => Str::random(60),
                ])->save();
            }
        );
    }

    /**
     * Get the authenticated user.
     *
     * @return Authenticatable The authenticated user
     *
     * @throws AuthenticationException If user is not authenticated
     */
    public function me(): Authenticatable
    {
        $user = Auth::user();

        if (! $user) {
            throw new AuthenticationException('User not authenticated');
        }

        // Load media relationship to get avatar URL
        $user->load('media');

        // Set avatar attribute directly from media
        $user->avatar = $user->getFirstMediaUrl('avatar', 'thumb');

        return $user;
    }

    /**
     * Refresh the token.
     *
     * @return string New JWT token
     *
     * @throws AuthenticationException If token refresh fails
     */
    public function refresh(): string
    {
        try {
            $token = Auth::refresh();

            if (! $token) {
                throw new AuthenticationException('Failed to refresh token');
            }

            return $token;
        } catch (JWTException $e) {
            throw new AuthenticationException('Failed to refresh token: ' . $e->getMessage());
        }
    }

    /**
     * Invalidate the token.
     */
    public function logout(): bool
    {
        Auth::logout();

        return true;
    }

    private function prepareUserWithToken(User $user, ?string $token = null): array
    {
        // Load media relationship and set avatar attribute for UserResource
        $user->load('media');
        $user->avatar = $user->getFirstMediaUrl('avatar', 'thumb');

        return [
            'user' => new UserResource($user),
            'token' => $token ?? JWTAuth::fromUser($user),
            'token_type' => 'Bearer',
        ];
    }
}
