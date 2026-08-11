<?php

namespace App\Repositories\Property\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface PropertyRepositoryInterface extends QueryableRepositoryInterface
{
    public function getProperties(): Collection;

    public function getActiveProperties(): Collection;

    public function getFilteredProperties(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function bulkDelete(array $ids): int;

    public function getPublicProperties(Request $request, int $perPage = 12): LengthAwarePaginator;

    public function findPublicProperty(int $id): \App\Models\Property;

    public function incrementViews(int $id): int;
}
