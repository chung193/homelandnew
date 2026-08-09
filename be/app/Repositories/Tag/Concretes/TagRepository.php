<?php

namespace App\Repositories\Tag\Concretes;

use App\Models\Tag;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Tag\Contracts\TagRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Spatie\QueryBuilder\AllowedFilter;

class TagRepository extends QueryableRepository implements TagRepositoryInterface
{
    /**
     * Specify Model class name.
     */
    protected function model(): string
    {
        return Tag::class;
    }

    /**
     * Return all tags.
     */
    public function getTags(): Collection
    {
        return $this->getFiltered();
    }

    public function getActiveTags(): Collection
    {
        return $this->model->get();
    }

    public function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            'name',
            'slug',
        ];
    }

    public function getAllowedSorts(): array
    {
        return ['id', 'name', 'slug', 'created_at', 'updated_at'];
    }

    public function getAllowedIncludes(): array
    {
        return [];
    }

    public function getAllowedFields(): array
    {
        return ['id', 'name', 'slug'];
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
