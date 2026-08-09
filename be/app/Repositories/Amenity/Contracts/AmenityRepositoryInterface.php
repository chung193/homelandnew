<?php

namespace App\Repositories\Amenity\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface AmenityRepositoryInterface extends QueryableRepositoryInterface
{
    public function getAmenities(): Collection;

    public function getActiveAmenities(): Collection;

    public function getFilteredAmenities(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function bulkDelete(array $ids): int;
}
