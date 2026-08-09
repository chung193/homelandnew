<?php

namespace App\Services\Concretes;

use App\Repositories\Tag\Contracts\TagRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\TagServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class TagService extends BaseService implements TagServiceInterface
{
    /**
     * TagService constructor.
     */
    public function __construct(protected TagRepositoryInterface $tagRepository)
    {
        $this->setRepository($tagRepository);
    }

    /**
     * Get all tags.
     */
    public function getTags(): Collection
    {
        return $this->repository->getFiltered();
    }

    /**
     * Get all tags.
     */
    public function getAllTags(): Collection
    {
        return $this->repository->all();
    }

    /**
     * Get filtered tags with pagination.
     */
    public function getFilteredTags(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        return $this->repository->paginateFiltered($perPage);
    }

    /**
     * Get tag by ID.
     */
    public function getTagById(int $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Tag not found');
        }
    }

    /**
     * Create tag.
     */
    public function createTag(array $data): Model
    {
        return $this->repository->create($data);
    }

    /**
     * Update tag.
     */
    public function updateTag(int $id, array $data): Model
    {
        try {
            return $this->repository->update($id, $data);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Tag not found');
        }
    }

    /**
     * Delete tag.
     */
    public function deleteTag(int $id): bool
    {
        try {
            $this->repository->delete($id);

            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Tag not found');
        }
    }

    /**
     * Delete tags.
     */
    public function deleteTags(array $ids): int
    {
        try {
            $count = $this->tagRepository->bulkDelete($ids);
            if ($count === 0) {
                abort(404, 'tags not found');
            }
            return $count;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Tag not found');
        }
    }

    /**
     * Get active tags.
     */
    public function getActiveTags(): Collection
    {
        return $this->tagRepository->getActiveTags();
    }
}
