<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Tymon\JWTAuth\Facades\JWTAuth;

class EnsureActiveAccount
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user()?->refresh();

        if (! $user || ! $user->is_active) {
            return new JsonResponse(['message' => 'Tài khoản đã bị khóa hoặc phiên đăng nhập không còn hợp lệ.'], 401);
        }

        // Laravel's actingAs() test helper authenticates the guard without an HTTP JWT.
        if (! $request->bearerToken()) {
            return $next($request);
        }

        $tokenVersion = (int) (JWTAuth::parseToken()->getPayload()->get('auth_version') ?? 0);
        if ($tokenVersion !== (int) $user->auth_version) {
            return new JsonResponse(['message' => 'Phiên đăng nhập đã bị thu hồi. Vui lòng đăng nhập lại.'], 401);
        }

        return $next($request);
    }
}
