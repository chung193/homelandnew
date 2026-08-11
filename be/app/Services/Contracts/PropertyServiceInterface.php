<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface PropertyServiceInterface extends BaseServiceInterface
{
    public function getProperties(): Collection;

    public function getActiveProperties(): Collection;

    public function getFilteredProperties(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function getPropertyById(int $id): ?Model;

    public function createProperty(array $data): Model;

    public function updateProperty(int $id, array $data): Model;

    public function deleteProperty(int $id): bool;

    public function deleteProperties(array $ids): int;

    public function getPublicProperties(Request $request, int $perPage = 12): LengthAwarePaginator;

    public function getPublicProperty(int $id): \App\Models\Property;

    public function recordView(int $id): int;
}
