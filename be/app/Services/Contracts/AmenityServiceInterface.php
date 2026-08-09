<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface AmenityServiceInterface extends BaseServiceInterface
{
    public function getAmenities(): Collection;

    public function getActiveAmenities(): Collection;

    public function getFilteredAmenities(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function getAmenityById(int $id): ?Model;

    public function createAmenity(array $data): Model;

    public function updateAmenity(int $id, array $data): Model;

    public function deleteAmenity(int $id): bool;

    public function deleteAmenities(array $ids): int;
}
