<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\Auth\ChangePasswordRequest;
use App\Http\Requests\Api\V1\Auth\ForgotRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Http\Requests\Api\V1\Auth\UpdateProfileRequest;
use App\Http\Resources\Api\User\UserResource;
use App\Models\User;
use App\Services\Contracts\AuthServiceInterface;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends BaseApiController
{
    /**
     * AuthController constructor.
     */
    public function __construct(
        private readonly AuthServiceInterface $authService
    ) {}

    /**
     * Register a new user.
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $this->authService->register($request->validated());

        return $this->successResponse($data);
    }

    /**
     * Login a user.
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $data = $this->authService->login($request->validated());

        return $this->successResponse($data);
    }

    /**
     * Forgot password user.
     */
    public function forgot(ForgotRequest $request): JsonResponse
    {
        $data = $this->authService->forgot($request->validated());

        return $this->successResponse($data);
    }

    /**
     * Forgot password user.
     */
    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $data = $this->authService->resetPassword($request->validated());

        return $this->successResponse($data);
    }

    public function verify(Request $request, $id, $hash)
    {
        $user = User::findOrFail($id);

        if (! hash_equals(
            (string) $hash,
            sha1($user->getEmailForVerification())
        )) {
            return response()->json([
                'message' => 'Link không hợp lệ',
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email đã xác thực',
            ]);
        }

        $user->markEmailAsVerified();

        event(new Verified($user));

        return response()->json([
            'message' => 'Xác thực thành công',
        ]);
    }

    public function resend(Request $request)
    {
        $request->user()
            ->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Đã gửi lại email xác thực',
        ]);
    }

    /**
     * Get the authenticated user.
     */
    public function me(): JsonResponse
    {
        $user = $this->authService->me();

        return $this->successResponse(new UserResource($user));
    }

    public function updateProfile(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->unauthorizedResponse('User not authenticated');
        }

        $user = $this->authService->updateProfile(
            $user,
            $request->validated(),
            $request->file('avatar'),
        );

        return $this->successResponse([
            'message' => 'Profile updated successfully',
            'user' => new UserResource($user),
        ]);
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return $this->unauthorizedResponse('User not authenticated');
        }

        $this->authService->changePassword(
            $user,
            (string) $request->input('current_password'),
            (string) $request->input('password'),
        );

        return $this->successResponse([
            'message' => 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.',
            'requires_login' => true,
        ]);
    }

    /**
     * Refresh the token.
     */
    public function refresh(): JsonResponse
    {
        $token = $this->authService->refresh();

        return $this->successResponse([
            'token' => $token,
            'token_type' => 'bearer',
        ]);
    }

    /**
     * Logout the user.
     */
    public function logout(): JsonResponse
    {
        $this->authService->logout();

        return $this->successResponse(['message' => 'Successfully logged out']);
    }
}
