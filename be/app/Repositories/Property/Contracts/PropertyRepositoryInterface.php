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
}
