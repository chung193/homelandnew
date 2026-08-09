<?php

namespace App\Services\Concretes;

use App\Repositories\PropertyType\Contracts\PropertyTypeRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\PropertyTypeServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class PropertyTypeService extends BaseService implements PropertyTypeServiceInterface
{
    public function __construct(protected PropertyTypeRepositoryInterface $propertyTypeRepository)
    {
        $this->setRepository($propertyTypeRepository);
    }

    public function getPropertyTypes(): Collection
    {
        return $this->repository->getFiltered();
    }

    public function getActivePropertyTypes(): Collection
    {
        return $this->repository->getActivePropertyTypes();
    }

    public function getFilteredPropertyTypes(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getFilteredPropertyTypes($request, $perPage);
    }

    public function getPropertyTypeById(int $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Property type not found');
        }
    }

    public function createPropertyType(array $data): Model
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name'] ?? 'property-type');
        $data['is_active'] = $data['is_active'] ?? true;
        return $this->repository->create($data);
    }

    public function updatePropertyType(int $id, array $data): Model
    {
        return $this->repository->update($id, $data);
    }

    public function deletePropertyType(int $id): bool
    {
        try {
            $this->repository->delete($id);
            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Property type not found');
        }
    }

    public function deletePropertyTypes(array $ids): int
    {
        try {
            $count = $this->propertyTypeRepository->bulkDelete($ids);
            if ($count === 0) {
                abort(404, 'property types not found');
            }
            return $count;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Property type not found');
        }
    }
}
