<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\Auth\ForgotRequest;
use App\Http\Requests\Api\V1\Auth\UpdateProfileRequest;
use App\Http\Requests\Api\V1\Auth\ChangePasswordRequest;
use App\Http\Requests\Api\V1\Auth\LoginRequest;
use App\Http\Requests\Api\V1\Auth\RegisterRequest;
use App\Http\Requests\Api\V1\Auth\ResetPasswordRequest;
use App\Http\Resources\Api\User\UserResource;
use App\Services\Contracts\AuthServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Auth\Events\Verified;
use Illuminate\Support\Facades\Hash;

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
                'message' => 'Link không hợp lệ'
            ], 400);
        }

        if ($user->hasVerifiedEmail()) {
            return response()->json([
                'message' => 'Email đã xác thực'
            ]);
        }

        $user->markEmailAsVerified();

        event(new Verified($user));

        return response()->json([
            'message' => 'Xác thực thành công'
        ]);
    }

    public function resend(Request $request)
    {
        $request->user()
            ->sendEmailVerificationNotification();

        return response()->json([
            'message' => 'Đã gửi lại email xác thực'
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

        $user->fill($request->validated());
        $user->save();
        $user->refresh();

        // Load media relationship before getting avatar URL
        $user->load('media');
        $user->avatar = $user->getFirstMediaUrl('avatar', 'thumb');

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

        if (! Hash::check($request->input('current_password'), $user->password)) {
            return $this->validationErrorResponse('Current password is incorrect');
        }

        $user->forceFill([
            'password' => Hash::make($request->input('password')),
        ])->save();

        return $this->successResponse([
            'message' => 'Password changed successfully',
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
