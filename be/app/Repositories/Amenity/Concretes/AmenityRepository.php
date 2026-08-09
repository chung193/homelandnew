<?php

namespace App\Repositories\Amenity\Concretes;

use App\Models\Amenity;
use App\Repositories\Amenity\Contracts\AmenityRepositoryInterface;
use App\Repositories\Base\Concretes\QueryableRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;

class AmenityRepository extends QueryableRepository implements AmenityRepositoryInterface
{
    protected function model(): string
    {
        return Amenity::class;
    }

    public function getAmenities(): Collection
    {
        return $this->getFiltered();
    }

    public function getActiveAmenities(): Collection
    {
        return $this->model->where('is_active', true)->get();
    }

    public function getFilteredAmenities(?Request $request = null, int $perPage = 15): LengthAwarePaginator
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
        return ['properties', 'propertyTypes'];
    }

    public function getAllowedFields(): array
    {
        return ['id', 'name', 'slug', 'icon', 'is_active', 'sort_order'];
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
