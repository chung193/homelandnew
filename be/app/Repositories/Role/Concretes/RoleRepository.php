<?php

namespace App\Repositories\Role\Concretes;

use App\Models\Role;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Role\Contracts\RoleRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;
use Spatie\QueryBuilder\AllowedInclude;


class RoleRepository extends QueryableRepository implements RoleRepositoryInterface
{
    /**
     * Specify Model class name
     */
    protected function model(): string
    {
        return Role::class;
    }

    /**
     * Return All Roles
     */
    public function getRoles(): Collection
    {
        return $this->getFiltered();
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
        return ['permissions'];
    }

    /**
     * Get allowed fields for this repository.
     */
    public function getAllowedFields(): array
    {
        return ['id', 'name', 'description', 'created_at', 'updated_at'];
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
