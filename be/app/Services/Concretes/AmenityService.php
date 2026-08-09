<?php

namespace App\Services\Concretes;

use App\Repositories\Amenity\Contracts\AmenityRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\AmenityServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

class AmenityService extends BaseService implements AmenityServiceInterface
{
    public function __construct(protected AmenityRepositoryInterface $amenityRepository)
    {
        $this->setRepository($amenityRepository);
    }

    public function getAmenities(): Collection
    {
        return $this->repository->getFiltered();
    }

    public function getActiveAmenities(): Collection
    {
        return $this->repository->getActiveAmenities();
    }

    public function getFilteredAmenities(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->getFilteredAmenities($request, $perPage);
    }

    public function getAmenityById(int $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Amenity not found');
        }
    }

    public function createAmenity(array $data): Model
    {
        $data['slug'] = $data['slug'] ?? Str::slug($data['name'] ?? 'amenity');
        $data['is_active'] = $data['is_active'] ?? true;
        return $this->repository->create($data);
    }

    public function updateAmenity(int $id, array $data): Model
    {
        return $this->repository->update($id, $data);
    }

    public function deleteAmenity(int $id): bool
    {
        try {
            $this->repository->delete($id);
            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Amenity not found');
        }
    }

    public function deleteAmenities(array $ids): int
    {
        try {
            $count = $this->amenityRepository->bulkDelete($ids);
            if ($count === 0) {
                abort(404, 'amenities not found');
            }
            return $count;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Amenity not found');
        }
    }
}
