<?php

namespace App\Repositories\Category\Concretes;

use App\Models\Category;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Category\Contracts\CategoryRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;

class CategoryRepository extends QueryableRepository implements CategoryRepositoryInterface
{
    /**
     * Specify Model class name
     */
    protected function model(): string
    {
        return Category::class;
    }

    /**
     * Return All Categories
     */
    public function getCategories(): Collection
    {
        return $this->getFiltered();
    }

    public function getActiveCategories(): Collection
    {
        return $this->model->whereNotNull('is_active')->get();
    }

    /**
     * Get allowed filters for this repository.
     */
    public function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            'name',
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
        return ['parent'];
    }

    /**
     * Get allowed fields for this repository.
     */
    public function getAllowedFields(): array
    {
        return ['id', 'name'];
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
