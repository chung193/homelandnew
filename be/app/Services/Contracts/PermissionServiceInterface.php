<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface PermissionServiceInterface extends BaseServiceInterface
{
    public function getPermissions(): Collection;

    public function getAllPermissions(): Collection;

    public function getFilteredPermissions(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function getPermissionById(int $id): ?Model;

    public function createPermission(array $data): Model;

    public function updatePermission(int $id, array $data): Model;

    public function deletePermission(int $id): bool;
    public function deletePermissions(array $ids): int;

    public function getActivePermissions(): Collection;

    public function findPermissionByIds(array $ids): Collection;
}
