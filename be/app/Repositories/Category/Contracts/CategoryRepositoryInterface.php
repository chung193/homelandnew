<?php

namespace App\Repositories\Category\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface CategoryRepositoryInterface extends QueryableRepositoryInterface
{
    /**
     * Return All Categories
     */
    public function getCategories(): Collection;

    public function getActiveCategories(): Collection;
    public function bulkDelete(array $ids): int;
}
