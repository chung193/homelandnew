<?php

namespace App\Services\Concretes;

use App\Http\Resources\Api\User\UserResource;
use App\Models\User;
use App\Repositories\User\Contracts\UserRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\AuthServiceInterface;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

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
            'registration_source' => 'self_registered',
            'account_type' => $data['account_type'],
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

        if (! $user->hasVerifiedEmail()) {
            auth()->logout();
            throw new AuthenticationException('Please verify your email before logging in');
        }

        if (! $user->is_active) {
            auth()->logout();
            throw new AuthenticationException('Your account is inactive');
        }

        return $this->prepareUserWithToken($user, $token);
    }

    public function forgot($email): string
    {
        return Password::sendResetLink(
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
                    'auth_version' => ((int) $user->auth_version) + 1,
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
        $user->load(['media', 'detail']);

        // Set avatar attribute directly from media
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
            throw new AuthenticationException('Failed to refresh token: '.$e->getMessage());
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

    public function updateProfile(User $user, array $data, ?UploadedFile $avatar = null): User
    {
        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
        ])->save();

        $user->detail()->updateOrCreate([], [
            'phone' => $data['phone'] ?? null,
            'address' => $data['address'] ?? null,
            'city' => $data['city'] ?? null,
            'birthday' => $data['birthday'] ?? null,
            'description' => $data['description'] ?? null,
        ]);

        if ($avatar) {
            $user->clearMediaCollection('avatar');
            $user->addMedia($avatar)->toMediaCollection('avatar');
        }

        $user->refresh()->load(['media', 'detail']);

        return $user;
    }

    public function changePassword(User $user, string $currentPassword, string $newPassword): void
    {
        if (! Hash::check($currentPassword, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['Mật khẩu hiện tại không chính xác.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($newPassword),
            'remember_token' => Str::random(60),
            'auth_version' => ((int) $user->auth_version) + 1,
        ])->save();

        Auth::logout();
    }

    private function prepareUserWithToken(User $user, ?string $token = null): array
    {
        // Load relationships required by UserResource.
        $user->load(['media', 'detail']);

        return [
            'user' => new UserResource($user),
            'token' => $token ?? JWTAuth::fromUser($user),
            'token_type' => 'Bearer',
        ];
    }
}
