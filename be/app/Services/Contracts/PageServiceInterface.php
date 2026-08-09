<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface PageServiceInterface extends BaseServiceInterface
{
    public function getPages(): Collection;

    public function getAllPages(): Collection;

    public function getFilteredPages(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function getPageById(int $id): ?Model;

    public function createPage(array $data): Model;

    public function updatePage(int $id, array $data): Model;

    public function deletePage(int $id): bool;
    public function deletePages(array $ids): int;
    public function getActivePages(): Collection;
}
