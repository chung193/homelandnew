<?php

namespace App\Repositories\Tag\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface TagRepositoryInterface extends QueryableRepositoryInterface
{
    /**
     * Return all tags.
     */
    public function getTags(): Collection;

    public function getActiveTags(): Collection;

    public function bulkDelete(array $ids): int;
}
