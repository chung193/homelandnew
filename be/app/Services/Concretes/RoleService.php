<?php

namespace App\Services\Concretes;

use App\Repositories\Role\Contracts\RoleRepositoryInterface;
use App\Repositories\Permission\Contracts\PermissionRepositoryInterface;

use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\RoleServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class RoleService extends BaseService implements RoleServiceInterface
{
    /**
     * RoleService constructor.
     */
    public function __construct(
        protected RoleRepositoryInterface $roleRepository,
        protected PermissionRepositoryInterface $permissionRepository,
    ) {
        $this->setRepository($roleRepository);
        $this->permissionRepository = $permissionRepository;
    }

    /**
     * Get all roles
     */
    public function getRoles(): Collection
    {
        return $this->repository->getFiltered();
    }

    /**
     * Get all roles
     */
    public function getAllRoles(): Collection
    {
        return $this->repository->all();
    }

    /**
     * Get filtered roles with pagination
     */
    public function getFilteredRoles(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        $roles = $this->repository->paginateFiltered($perPage);
        $roles->load('permissions');
        return $roles;
    }

    /**
     * Get role by ID
     */
    public function getRoleById(int $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Role not found');
        }
    }

    /**
     * Create role
     */
    public function createRole(array $data): Model
    {
        return $this->repository->create($data);
    }

    /**
     * Update role
     */
    public function updateRole(int $id, array $data): Model
    {
        try {
            return $this->repository->update($id, $data);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Role not found');
        }
    }

    /**
     * Delete role
     */
    public function deleteRole(int $id): bool
    {
        try {
            $this->repository->delete($id);

            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Role not found');
        }
    }

    /**
     * Delete roles
     */

    public function deleteRoles(array $ids): int
    {
        try {
            $this->roleRepository->bulkDelete($ids);
            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Role not found');
        }
    }

    public function assignPermissions(int $roleId, array $permissionIds): void
    {
        $role = $this->roleRepository->findOrFail($roleId);

        $permissions = $this->permissionRepository
            ->getPermissionByIds($permissionIds);

        $role->syncPermissions($permissions->pluck('id')->toArray());
    }
}
