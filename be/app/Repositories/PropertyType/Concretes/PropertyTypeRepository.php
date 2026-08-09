<?php

namespace App\Repositories\PropertyType\Concretes;

use App\Models\PropertyType;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\PropertyType\Contracts\PropertyTypeRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;

class PropertyTypeRepository extends QueryableRepository implements PropertyTypeRepositoryInterface
{
    protected function model(): string
    {
        return PropertyType::class;
    }

    public function getPropertyTypes(): Collection
    {
        return $this->getFiltered();
    }

    public function getActivePropertyTypes(): Collection
    {
        return $this->model->where('is_active', true)->get();
    }

    public function getFilteredPropertyTypes(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->paginateFiltered($perPage, ['*'], ['name']);
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
        return ['id', 'name', 'sort_order', 'created_at', 'updated_at'];
    }

    public function getAllowedIncludes(): array
    {
        return ['amenities'];
    }

    public function getAllowedFields(): array
    {
        return ['id', 'name', 'slug', 'is_active', 'sort_order'];
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
