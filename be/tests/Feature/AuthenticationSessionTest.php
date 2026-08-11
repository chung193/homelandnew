<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

uses(RefreshDatabase::class);

function authenticatedUser(): User
{
    return User::factory()->create([
        'password' => Hash::make('Password123!'),
        'email_verified_at' => now(),
        'is_active' => true,
        'auth_version' => 0,
    ]);
}

function loginToken(User $user): string
{
    return test()->postJson('/api/v1/auth/login', [
        'email' => $user->email,
        'password' => 'Password123!',
    ])->assertOk()->json('data.token');
}

test('locked account immediately loses access with an existing token', function () {
    $user = authenticatedUser();
    $token = loginToken($user);

    $user->update(['is_active' => false]);

    $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
});

test('changing password revokes the current token and requires login again', function () {
    $user = authenticatedUser();
    $token = loginToken($user);

    $this->withToken($token)->patchJson('/api/v1/auth/change-password', [
        'current_password' => 'Password123!',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])->assertOk()->assertJsonPath('data.requires_login', true);

    $this->withToken($token)->getJson('/api/v1/auth/me')->assertUnauthorized();
});
