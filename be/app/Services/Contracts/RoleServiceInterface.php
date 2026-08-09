<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface RoleServiceInterface extends BaseServiceInterface
{
    public function getRoles(): Collection;
    public function getAllRoles(): Collection;
    public function getFilteredRoles(?Request $request = null, int $perPage = 15): LengthAwarePaginator;
    public function getRoleById(int $id): ?Model;
    public function createRole(array $data): Model;
    public function updateRole(int $id, array $data): Model;
    public function deleteRole(int $id): bool;
    public function deleteRoles(array $ids): int;
    public function assignPermissions(int $roleId, array $permissionIds): void;
}
