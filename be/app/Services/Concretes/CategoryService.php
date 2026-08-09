<?php

namespace App\Services\Concretes;

use App\Repositories\Category\Contracts\CategoryRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\CategoryServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;

class CategoryService extends BaseService implements CategoryServiceInterface
{
    /**
     * CategoryService constructor.
     */
    public function __construct(protected CategoryRepositoryInterface $categoryRepository)
    {
        $this->setRepository($categoryRepository);
    }

    /**
     * Get all categories
     */
    public function getCategories(): Collection
    {
        return $this->repository->getFiltered();
    }

    /**
     * Get all categories
     */
    public function getAllCategories(): Collection
    {
        return $this->repository->all();
    }

    /**
     * Get filtered categories with pagination
     */
    public function getFilteredCategories(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        $categories = $this->repository->paginateFiltered($perPage);
        // Load relationships từ items
        $categories->each(function ($category) {
            $category->load('parent');
        });
        return $categories;
    }

    /**
     * Get category by ID
     */
    public function getCategoryById(int $id): ?Model
    {
        try {
            return $this->repository->findOrFail($id);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Category not found');
        }
    }

    /**
     * Create category
     */
    public function createCategory(array $data): Model
    {
        $data['parent_id'] = $data['parent_id'] ?: null;
        return $this->repository->create($data);
    }

    /**
     * Update category
     */
    public function updateCategory(int $id, array $data): Model
    {
        try {
            return $this->repository->update($id, $data);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Category not found');
        }
    }

    /**
     * Delete category
     */
    public function deleteCategory(int $id): bool
    {
        try {
            $this->repository->delete($id);

            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Category not found');
        }
    }


    /**
     * Delete users
     */

    public function deleteCategories(array $ids): int
    {
        try {
            $count = $this->categoryRepository->bulkDelete($ids);
            if ($count === 0) {
                abort(404, 'categories not found');
            }
            return $count;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Category not found');
        }
    }

    /**
     * Get active categories
     */
    public function getActiveCategories(): Collection
    {
        return $this->categoryRepository->getActiveCategories();
    }
}
