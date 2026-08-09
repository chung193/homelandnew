<?php

namespace App\Services\Concretes;

use App\Models\Property;
use App\Repositories\Property\Contracts\PropertyRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\PropertyServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class PropertyService extends BaseService implements PropertyServiceInterface
{
    public function __construct(protected PropertyRepositoryInterface $propertyRepository)
    {
        $this->setRepository($propertyRepository);
    }

    public function getProperties(): Collection
    {
        return $this->repository->getFiltered();
    }

    public function getActiveProperties(): Collection
    {
        return $this->repository->getActiveProperties();
    }

    public function getFilteredProperties(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getFilteredProperties($request, $perPage);
    }

    public function getPropertyById(int $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Property not found');
        }
    }

    public function createProperty(array $data): Model
    {
        $data['user_id'] = $data['user_id'] ?? auth()->id();
        $data['slug'] = $data['slug'] ?? Str::slug($data['title'] ?? 'property');
        $data['is_active'] = $data['is_active'] ?? true;
        $data['is_deleted'] = $data['is_deleted'] ?? false;

        $amenities = $data['amenities'] ?? null;
        unset($data['amenities']);

        $property = $this->repository->create($data);

        if ($amenities) {
            $property->amenities()->sync($amenities);
        }

        $property->load('amenities');

        return $property;
    }

    public function updateProperty(int $id, array $data): Model
    {
        $amenities = $data['amenities'] ?? null;
        unset($data['amenities']);

        $property = $this->repository->update($id, $data);

        if ($amenities !== null) {
            $property->amenities()->sync($amenities);
        }

        $property->load('amenities');

        return $property;
    }

    public function deleteProperty(int $id): bool
    {
        try {
            $this->repository->delete($id);
            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Property not found');
        }
    }

    public function deleteProperties(array $ids): int
    {
        try {
            $count = $this->propertyRepository->bulkDelete($ids);
            if ($count === 0) {
                abort(404, 'properties not found');
            }
            return $count;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Property not found');
        }
    }
}
