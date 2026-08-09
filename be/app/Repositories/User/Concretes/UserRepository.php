<?php

namespace App\Repositories\User\Concretes;

use App\Models\User;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\User\Contracts\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;

class UserRepository extends QueryableRepository implements UserRepositoryInterface
{
    /**
     * Specify Model class name
     */
    protected function model(): string
    {
        return User::class;
    }

    /**
     * Return All Users
     */
    public function getUsers(): Collection
    {
        return $this->getFiltered();
    }

    public function getActiveUsers(): Collection
    {
        return $this->model->whereNotNull('email_verified_at')->get();
    }

    /**
     * Get allowed filters for this repository.
     */
    public function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            'name',
            'email',
            'is_active'
        ];
    }

    /**
     * Get allowed sorts for this repository.
     */
    public function getAllowedSorts(): array
    {
        return ['id', 'name', 'is_active', 'created_at', 'updated_at'];
    }

    /**
     * Get allowed includes for this repository.
     */
    public function getAllowedIncludes(): array
    {
        // Add any relationships you want to allow including
        // For example: 'posts', 'comments', etc.
        return ['roles', 'detail'];
    }

    /**
     * Get allowed fields for this repository.
     */
    public function getAllowedFields(): array
    {
        return ['id', 'name', 'email', 'is_active', 'created_at', 'updated_at'];
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
