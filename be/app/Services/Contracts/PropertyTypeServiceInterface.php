<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface PropertyTypeServiceInterface extends BaseServiceInterface
{
    public function getPropertyTypes(): Collection;

    public function getActivePropertyTypes(): Collection;

    public function getFilteredPropertyTypes(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function getPropertyTypeById(int $id): ?Model;

    public function createPropertyType(array $data): Model;

    public function updatePropertyType(int $id, array $data): Model;

    public function deletePropertyType(int $id): bool;

    public function deletePropertyTypes(array $ids): int;
}
