<?php

namespace App\Repositories\Permission\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface PermissionRepositoryInterface extends QueryableRepositoryInterface
{
    /**
     * Return All Permissions
     */
    public function getPermissions(): Collection;

    public function getActivePermissions(): Collection;

    public function getPermissionByIds(array $ids): Collection;
    public function bulkDelete(array $ids): int;
}
