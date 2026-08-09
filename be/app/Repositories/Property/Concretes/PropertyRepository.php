<?php

namespace App\Repositories\Property\Concretes;

use App\Models\Property;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Property\Contracts\PropertyRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;

class PropertyRepository extends QueryableRepository implements PropertyRepositoryInterface
{
    protected function model(): string
    {
        return Property::class;
    }

    public function getProperties(): Collection
    {
        return $this->getFiltered();
    }

    public function getActiveProperties(): Collection
    {
        return $this->model->where('is_active', true)->where('is_deleted', false)->get();
    }

    public function getFilteredProperties(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->paginateFiltered($perPage, ['*'], ['title', 'address', 'city', 'district', 'ward']);
    }

    public function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            AllowedFilter::exact('property_type_id'),
            AllowedFilter::exact('listing_type'),
            AllowedFilter::exact('status'),
            'title',
            'city',
        ];
    }

    public function getAllowedSorts(): array
    {
        return ['id', 'title', 'price', 'created_at', 'updated_at'];
    }

    public function getAllowedIncludes(): array
    {
        return ['propertyType', 'amenities'];
    }

    public function getAllowedFields(): array
    {
        return ['id', 'title', 'slug', 'listing_type', 'price', 'area', 'status', 'is_active'];
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
