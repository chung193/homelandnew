<?php

namespace App\Services\Client\Concretes;

use App\Models\Post;
use App\Models\Tag;
use App\Models\User;
use App\Repositories\Post\Contracts\PostRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Client\Contracts\PostServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use App\DTO\PostStatsDTO;
use Illuminate\Support\Str;

class PostService extends BaseService implements PostServiceInterface
{
    /**
     * PostService constructor.
     */
    public function __construct(protected PostRepositoryInterface $postRepository)
    {
        $this->setRepository($postRepository);
    }

    /**
     * Get all posts
     */
    public function getPosts(): Collection
    {
        return $this->repository->getFiltered();
    }

    /**
     * Get all posts
     */
    public function getAllPosts(): Collection
    {
        return $this->repository->all();
    }

    /**
     * Get filtered posts with pagination
     */
    public function getFilteredPosts(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        $perPage = (int) ($request?->input('per_page', $perPage) ?? $perPage);
        $resolvedUserId = (int) ($request?->input('user_id', 0) ?? 0);
        $userSlug = trim((string) ($request?->input('user_slug', '') ?? ''));

        if ($resolvedUserId <= 0 && $userSlug !== '') {
            $resolvedUserId = (int) (User::query()
                ->select(['id', 'name'])
                ->get()
                ->first(function (User $user) use ($userSlug) {
                    return Str::slug($user->name) === $userSlug;
                })
                ?->id ?? 0);
        }

        $query = Post::query()
            ->with(['user', 'category', 'tags'])
            ->orderByDesc('created_at');

        if ($resolvedUserId > 0) {
            $query->where('user_id', $resolvedUserId);
        }

        $categorySlug = trim((string) ($request?->input('category_slug', '') ?? ''));
        if ($categorySlug !== '') {
            $query->whereHas('category', function ($builder) use ($categorySlug) {
                $builder->where('slug', $categorySlug);
            });
        }

        $tagSlug = trim((string) ($request?->input('tag_slug', '') ?? ''));
        if ($tagSlug !== '') {
            $query->whereHas('tags', function ($builder) use ($tagSlug) {
                $builder->where('slug', $tagSlug);
            });
        }

        $search = trim((string) ($request?->input('search', '') ?? ''));
        if ($search === '') {
            $search = trim((string) ($request?->input('keyword', '') ?? ''));
        }

        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $posts = $query->paginate($perPage);
        $posts->appends($request?->query() ?? []);

        $posts->each(function ($post) {
            $post->avatar = $post->getFirstMediaUrl('cover', 'preview');
        });

        return $posts;
    }

    /**
     * Get posts by category with pagination
     */
    public function getPostsByCategoryId(int $categoryId, int $perPage = 15): LengthAwarePaginator
    {
        $posts = $this->postRepository->getPostsByCategoryId($categoryId, $perPage);

        $posts->each(function ($post) {
            $post->load(['user', 'category', 'tags']);
            $post->avatar = $post->getFirstMediaUrl('cover', 'preview');
        });

        return $posts;
    }

    /**
     * Get posts by category slug with pagination
     */
    public function getPostsByCategorySlug(string $categorySlug, int $perPage = 15): LengthAwarePaginator
    {
        $posts = $this->postRepository->getPostsByCategorySlug($categorySlug, $perPage);

        $posts->each(function ($post) {
            $post->load(['user', 'category', 'tags']);
            $post->avatar = $post->getFirstMediaUrl('cover', 'preview');
        });

        return $posts;
    }

    /**
     * Get posts by user with pagination
     */
    public function getPostsByUserId(int $userId, int $perPage = 15): LengthAwarePaginator
    {
        $posts = $this->postRepository->getPostsByUserId($userId, $perPage);

        $posts->each(function ($post) {
            $post->load(['user', 'category', 'tags']);
            $post->avatar = $post->getFirstMediaUrl('cover', 'preview');
        });

        return $posts;
    }

    /**
     * Get posts by user slug (slugified user name)
     */
    public function getPostsByUserSlug(string $userSlug, int $perPage = 15): LengthAwarePaginator
    {
        $resolvedUserId = User::query()
            ->select(['id', 'name'])
            ->get()
            ->first(function (User $user) use ($userSlug) {
                return Str::slug($user->name) === $userSlug;
            })
            ?->id;

        return $this->getPostsByUserId((int) ($resolvedUserId ?? 0), $perPage);
    }

    /**
     * Get post by ID
     */
    public function getPostById(int $id): ?Model
    {
        try {
            $post = $this->repository->findOrFail($id);
            $post->increment('views');
            $post->load(['user', 'category', 'comments', 'tags']);
            if ($post->relationLoaded('comments')) {
                $post->setRelation('comments', $this->filterApprovedComments($post->comments));
            }
            $post->avatar = $post->getFirstMediaUrl('cover', 'preview');
            return $post;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Post not found');
        }
    }

    /**
     * Get post by slug
     */
    public function getPostBySlug(string $slug): ?Model
    {
        $post = $this->postRepository->findPostBySlug($slug);
        if (!$post) {
            throw new ModelNotFoundException('Post not found');
        }

        $post->increment('views');
        $post->load(['user', 'category', 'comments', 'tags']);
        if ($post->relationLoaded('comments')) {
            $post->setRelation('comments', $this->filterApprovedComments($post->comments));
        }
        $post->avatar = $post->getFirstMediaUrl('cover', 'preview');

        return $post;
    }

    private function filterApprovedComments(Collection $comments): Collection
    {
        $filtered = $comments
            ->filter(fn($comment) => (bool) $comment->is_approved)
            ->values();

        $filtered->each(function ($comment) {
            if ($comment->relationLoaded('replies')) {
                $comment->setRelation('replies', $this->filterApprovedComments($comment->replies));
            }
        });

        return $filtered;
    }
    /**
     * Create post
     */
    public function createPost(array $data): Model
    {
        $tagInputs = $data['tags'] ?? [];
        unset($data['tags']);

        $post = $this->repository->create($data);
        $this->syncPostTags($post, is_array($tagInputs) ? $tagInputs : []);

        return $post->load(['user', 'category', 'tags']);
    }

    /**
     * Update post
     */
    public function updatePost(int $id, array $data): Model
    {
        try {
            $tagInputs = $data['tags'] ?? null;
            unset($data['tags']);

            $post = $this->repository->update($id, $data);
            if (is_array($tagInputs)) {
                $this->syncPostTags($post, $tagInputs);
            }

            return $post->load(['user', 'category', 'tags']);
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Post not found');
        }
    }

    /**
     * Delete post
     */
    public function deletePost(int $id): bool
    {
        try {
            $this->repository->delete($id);

            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Post not found');
        }
    }

    /**
     * Get active posts
     */
    public function getActivePosts(): Collection
    {
        return $this->postRepository->getActivePosts();
    }

    /**
     * Delete posts
     */

    public function deletePosts(array $ids): int
    {
        try {
            $count = $this->postRepository->bulkDelete($ids);
            if ($count === 0) {
                abort(404, 'posts not found');
            }
            return $count;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('Post not found');
        }
    }

    public function getPostsCount(): PostStatsDTO
    {
        $total = $this->repository->count();

        $draft = $this->repository->count(['status' => 'draft']);

        $published = $this->repository->count(['status' => 'published']);

        $pending = $this->repository->count(['status' => 'pending']);

        $archived = $this->repository->count(['status' => 'archived']);

        return new PostStatsDTO(
            $total,
            $draft,
            $published,
            $pending,
            $archived
        );
    }

    /**
     * @param array<int, int|string> $tagInputs
     */
    private function syncPostTags(Model $post, array $tagInputs): void
    {
        $tagIds = [];

        foreach ($tagInputs as $input) {
            if (is_int($input) || ctype_digit((string) $input)) {
                $tagId = (int) $input;
                if ($tagId > 0) {
                    $tagIds[] = $tagId;
                }
                continue;
            }

            $rawName = trim((string) $input);
            if ($rawName === '') {
                continue;
            }

            $slug = Str::slug($rawName);
            if ($slug === '') {
                $slug = 'tag-' . substr(md5($rawName), 0, 12);
            }

            $tag = Tag::query()->firstOrCreate(
                ['slug' => $slug],
                ['name' => $rawName]
            );

            $tagIds[] = (int) $tag->id;
        }

        $post->tags()->sync(array_values(array_unique($tagIds)));
    }
}
