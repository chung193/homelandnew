<?php

namespace App\Services\Concretes;

use App\Repositories\Permission\Contracts\PermissionRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\PermissionServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class PermissionService extends BaseService implements PermissionServiceInterface
{
    /**
     * PermissionService constructor.
     */
    public function __construct(
        protected PermissionRepositoryInterface $permissionRepository,
    ) {
        $this->setRepository($permissionRepository);
    }

    /**
     * Get all permissions
     */
    public function getPermissions(): Collection
    {
        return $this->repository->getFiltered();
    }

    /**
     * Get all permissions
     */
    public function getAllPermissions(): Collection
    {
        return $this->repository->all();
    }

    /**
     * Get filtered permissions with pagination
     */
    public function getFilteredPermissions(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginateFiltered($perPage);
    }

    /**
     * Get permission by ID
     */
    public function getPermissionById(int $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Permission not found');
        }
    }

    /**
     * Create permission
     */
    public function createPermission(array $data): Model
    {
        return $this->repository->create($data);
    }

    /**
     * Update permission
     */
    public function updatePermission(int $id, array $data): Model
    {
        try {
            return $this->repository->update($id, $data);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Role not found');
        }
    }

    /**
     * Delete permission
     */
    public function deletePermission(int $id): bool
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

    public function deletePermissions(array $ids): int
    {
        try {
            $this->permissionRepository->bulkDelete($ids);
            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Role not found');
        }
    }

    /**
     * Get active permissions
     */
    public function getActivePermissions(): Collection
    {
        return $this->permissionRepository->getActivePermissions();
    }

    public function findPermissionByIds(array $ids): Collection
    {
        return $this->permissionRepository->getPermissionByIds($ids);
    }
}
