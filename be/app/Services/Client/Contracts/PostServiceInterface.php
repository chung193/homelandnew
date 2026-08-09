<?php

namespace App\Services\Client\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\DTO\PostStatsDTO;

interface PostServiceInterface extends BaseServiceInterface
{
    public function getPosts(): Collection;

    public function getAllPosts(): Collection;

    public function getFilteredPosts(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function getPostsByCategoryId(int $categoryId, int $perPage = 15): LengthAwarePaginator;
    public function getPostsByCategorySlug(string $categorySlug, int $perPage = 15): LengthAwarePaginator;
    public function getPostsByUserId(int $userId, int $perPage = 15): LengthAwarePaginator;
    public function getPostsByUserSlug(string $userSlug, int $perPage = 15): LengthAwarePaginator;

    public function getPostById(int $id): ?Model;
    public function getPostBySlug(string $slug): ?Model;

    public function createPost(array $data): Model;

    public function updatePost(int $id, array $data): Model;

    public function deletePost(int $id): bool;
    public function deletePosts(array $ids): int;

    public function getPostsCount(): PostStatsDTO;
    public function getActivePosts(): Collection;
}
