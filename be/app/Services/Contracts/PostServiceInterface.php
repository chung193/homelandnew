<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\DTO\PostStatsDTO;
use Illuminate\Http\UploadedFile;

interface PostServiceInterface extends BaseServiceInterface
{
    public function getPosts(): Collection;

    public function getAllPosts(): Collection;

    public function getFilteredPosts(?Request $request = null, int $perPage = 15): LengthAwarePaginator;

    public function getPostById(int $id): ?Model;

    public function createPost(array $data): Model;

    public function updatePost(int $id, array $data): Model;

    public function deletePost(int $id): bool;
    public function deletePosts(array $ids): int;

    public function getPostsCount(): PostStatsDTO;
    public function getActivePosts(): Collection;

    /**
     * Import posts from a WordPress WXR XML file.
     *
     * @param array<string, mixed> $options
     * @return array<string, mixed>
     */
    public function importWordpressXml(UploadedFile $file, int $userId, array $options = []): array;
}
