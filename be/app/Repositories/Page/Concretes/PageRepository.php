<?php

namespace App\Repositories\Page\Concretes;

use App\Models\Page;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Page\Contracts\PageRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;

class PageRepository extends QueryableRepository implements PageRepositoryInterface
{
    /**
     * Specify Model class name
     */
    protected function model(): string
    {
        return Page::class;
    }

    /**
     * Return All Pages
     */
    public function getPages(): Collection
    {
        return $this->getFiltered();
    }

    public function getActivePages(): Collection
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
        ];
    }

    /**
     * Get allowed sorts for this repository.
     */
    public function getAllowedSorts(): array
    {
        return ['id', 'name', 'created_at', 'updated_at', 'published_at'];
    }

    /**
     * Get allowed includes for this repository.
     */
    public function getAllowedIncludes(): array
    {
        // Add any relationships you want to allow including
        // For example: 'posts', 'comments', etc.
        return ['user'];
    }

    /**
     * Get allowed fields for this repository.
     */
    public function getAllowedFields(): array
    {
        return ['id', 'name', 'email'];
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
