<?php

namespace App\Services\Contracts;

use App\Models\User;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Http\UploadedFile;

interface AuthServiceInterface
{
    public function register(array $data): array;

    public function forgot(string $email): string;

    public function resetPassword(array $data): string;

    public function login(array $credentials): array;

    public function me(): Authenticatable;

    public function refresh(): string;

    public function logout(): bool;

    public function updateProfile(User $user, array $data, ?UploadedFile $avatar = null): User;

    public function changePassword(User $user, string $currentPassword, string $newPassword): void;
}
