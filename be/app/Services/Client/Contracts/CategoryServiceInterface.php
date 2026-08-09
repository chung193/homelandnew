<?php

namespace App\Services\Client\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;

interface CategoryServiceInterface extends BaseServiceInterface
{
    public function getAllCategories(): Collection;
}
