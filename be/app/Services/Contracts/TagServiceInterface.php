<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

interface TagServiceInterface extends BaseServiceInterface
{
    public function getTags(): Collection;

    public function getAllTags(): Collection;

    public function getFilteredTags(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function getTagById(int $id): ?Model;

    public function createTag(array $data): Model;

    public function updateTag(int $id, array $data): Model;

    public function deleteTag(int $id): bool;

    public function deleteTags(array $ids): int;

    public function getActiveTags(): Collection;
}
