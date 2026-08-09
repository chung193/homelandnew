<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface CategoryServiceInterface extends BaseServiceInterface
{
    public function getCategories(): Collection;

    public function getAllCategories(): Collection;

    public function getFilteredCategories(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function getCategoryById(int $id): ?Model;

    public function createCategory(array $data): Model;

    public function updateCategory(int $id, array $data): Model;

    public function deleteCategory(int $id): bool;
    public function deleteCategories(array $ids): int;


    public function getActiveCategories(): Collection;
}
