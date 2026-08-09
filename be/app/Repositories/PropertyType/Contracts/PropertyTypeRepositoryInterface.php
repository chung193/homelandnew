<?php

namespace App\Repositories\PropertyType\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface PropertyTypeRepositoryInterface extends QueryableRepositoryInterface
{
    public function getPropertyTypes(): Collection;

    public function getActivePropertyTypes(): Collection;

    public function getFilteredPropertyTypes(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function bulkDelete(array $ids): int;
}
