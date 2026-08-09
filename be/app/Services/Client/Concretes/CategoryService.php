<?php

namespace App\Services\Client\Concretes;

use App\Repositories\Category\Contracts\CategoryRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Client\Contracts\CategoryServiceInterface;
use Illuminate\Database\Eloquent\Collection;

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
     * Get all categories.
     */
    public function getAllCategories(): Collection
    {
        return $this->repository->all();
    }
}
