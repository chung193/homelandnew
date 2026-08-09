<?php

namespace App\Repositories\Page\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface PageRepositoryInterface extends QueryableRepositoryInterface
{
    /**
     * Return All Pages
     */
    public function getPages(): Collection;

    public function getActivePages(): Collection;

    public function bulkDelete(array $ids): int;
}
