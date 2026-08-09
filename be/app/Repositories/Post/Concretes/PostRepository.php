<?php

namespace App\Repositories\Post\Concretes;

use App\Models\Post;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Post\Contracts\PostRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;
use Spatie\QueryBuilder\AllowedFilter;

class PostRepository extends QueryableRepository implements PostRepositoryInterface
{
    /**
     * Specify Model class name
     */
    protected function model(): string
    {
        return Post::class;
    }

    /**
     * Return All Posts
     */
    public function getPosts(): Collection
    {
        return $this->getFiltered();
    }

    public function getPostsByCategoryId(int $categoryId, int $perPage = 15): LengthAwarePaginator
    {
        $perPage = request('per_page', $perPage);

        return $this->query()
            ->where('category_id', $categoryId)
            ->paginate($perPage);
    }

    public function getPostsByCategorySlug(string $categorySlug, int $perPage = 15): LengthAwarePaginator
    {
        $perPage = request('per_page', $perPage);

        return $this->query()
            ->whereHas('category', function ($query) use ($categorySlug) {
                $query->where('slug', $categorySlug);
            })
            ->paginate($perPage);
    }

    public function getPostsByUserId(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        $perPage = request('per_page', $perPage);

        return $this->query()
            ->where('user_id', $userId)
            ->paginate($perPage);
    }

    public function findPostBySlug(string $slug): ?Post
    {
        /** @var Post|null $post */
        $post = $this->query()
            ->where('slug', $slug)
            ->first();

        return $post;
    }

    public function getActivePosts(): Collection
    {
        return $this->model->whereNotNull('is_active')->get();
    }

    /**
     * Get allowed filters for this repository.
     */
    public function getAllowedFilters(): array
    {
        return [
            AllowedFilter::exact('id'),
            'name',
        ];
    }

    /**
     * Get allowed sorts for this repository.
     */
    public function getAllowedSorts(): array
    {
        return ['id', 'name', 'created_at', 'updated_at', 'published_at'];
    }

    /**
     * Get allowed includes for this repository.
     */
    public function getAllowedIncludes(): array
    {
        // Add any relationships you want to allow including
        // For example: 'posts', 'comments', etc.
        return ['category', 'user'];
    }

    /**
     * Get allowed fields for this repository.
     */
    public function getAllowedFields(): array
    {
        return ['id', 'name'];
    }

    public function bulkDelete(array $ids): int
    {
        return $this->model->whereIn('id', $ids)->delete();
    }
}
