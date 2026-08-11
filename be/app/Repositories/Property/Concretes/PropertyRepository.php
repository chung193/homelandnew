<?php

namespace App\Repositories\Property\Concretes;

use App\Models\Ward;
use App\Models\Property;
use App\Models\Province;
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

    public function getPublicProperties(Request $request, int $perPage = 12): LengthAwarePaginator
    {
        $query = $this->model->newQuery()
            ->with(['propertyType', 'amenities', 'media'])
            ->active()
            ->where('status', 'published')
            ->latest('created_at');

        $search = trim((string) $request->input('q', ''));
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere('ward', 'like', "%{$search}%");
            });
        }

        if ($propertyTypeId = $request->integer('property_type_id')) {
            $query->where('property_type_id', $propertyTypeId);
        }

        $listingType = (string) $request->input('listing_type', '');
        if (in_array($listingType, ['sale', 'rent'], true)) {
            $query->where('listing_type', $listingType);
        }

        if ($provinceCode = $request->integer('province_code')) {
            $province = Province::query()->where('code', $provinceCode)->orWhere('id', $provinceCode)->first();
            if ($province) {
                $query->where('city', 'like', "%{$province->name}%");
            }
        }

        if ($wardCode = $request->integer('ward_code')) {
            $ward = Ward::query()->where('code', $wardCode)->orWhere('id', $wardCode)->first();
            if ($ward) {
                $query->where('ward', 'like', "%{$ward->name}%");
            }
        }

        return $query->paginate($perPage);
    }

    public function findPublicProperty(int $id): Property
    {
        return $this->model->newQuery()
            ->with(['propertyType', 'amenities', 'media'])
            ->active()
            ->where('status', 'published')
            ->findOrFail($id);
    }

    public function incrementViews(int $id): int
    {
        $property = $this->findPublicProperty($id);
        $property->increment('views');

        return (int) $property->fresh()->views;
    }
}
