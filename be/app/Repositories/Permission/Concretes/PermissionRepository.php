<?php

namespace App\Repositories\Permission\Concretes;

use App\Models\Permission;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Permission\Contracts\PermissionRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;

class PermissionRepository extends QueryableRepository implements PermissionRepositoryInterface
{
    /**
     * Specify Model class name
     */
    protected function model(): string
    {
        return Permission::class;
    }

    /**
     * Return All Permissions
     */
    public function getPermissions(): Collection
    {
        return $this->getFiltered();
    }

    public function getActivePermissions(): Collection
    {
        return $this->model->whereNull('deleted_at')->get();
    }

    /**
     * Get allowed filters for this repository.
     */
    public function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            'name',
            'guard_name',
        ];
    }

    /**
     * Get allowed sorts for this repository.
     */
    public function getAllowedSorts(): array
    {
        return ['id', 'name', 'created_at', 'updated_at'];
    }

    /**
     * Get allowed includes for this repository.
     */
    public function getAllowedIncludes(): array
    {
        // Add any relationships you want to allow including
        // For example: 'posts', 'comments', etc.
        return [];
    }

    /**
     * Get allowed fields for this repository.
     */
    public function getAllowedFields(): array
    {
        return ['id', 'name', 'description', 'created_at', 'updated_at'];
    }

    public function getPermissionByIds(array $ids): Collection
    {
        return $this->model
            ->whereIn('id', $ids)
            ->get();
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
