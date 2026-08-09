<?php

namespace App\Repositories\Role\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

interface RoleRepositoryInterface extends QueryableRepositoryInterface
{
    /**
     * Return All Roles
     */
    public function getRoles(): Collection;
    public function bulkDelete(array $ids): int;
}
