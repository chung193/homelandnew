<?php

namespace App\Repositories\Post\Contracts;

use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

interface PostRepositoryInterface extends QueryableRepositoryInterface
{
    /**
     * Return All Posts
     */
    public function getPosts(): Collection;

    public function getPostsByCategoryId(int $categoryId, int $perPage = 15): LengthAwarePaginator;
    public function getPostsByCategorySlug(string $categorySlug, int $perPage = 15): LengthAwarePaginator;
    public function getPostsByUserId(int $userId, int $perPage = 15): LengthAwarePaginator;
    public function findPostBySlug(string $slug): ?\App\Models\Post;

    public function getActivePosts(): Collection;
    public function bulkDelete(array $ids): int;
}
