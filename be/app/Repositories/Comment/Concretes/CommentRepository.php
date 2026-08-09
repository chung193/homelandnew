<?php

namespace App\Repositories\Comment\Concretes;

use App\Models\Comment;
use App\Models\Page;
use App\Models\Post;
use App\Repositories\Base\Concretes\QueryableRepository;
use App\Repositories\Comment\Contracts\CommentRepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Pagination\LengthAwarePaginator;

class CommentRepository extends QueryableRepository implements CommentRepositoryInterface
{
    protected function model(): string
    {
        return Comment::class;
    }

    public function findCommentWithCommentable(int $id): Comment
    {
        /** @var Comment $comment */
        $comment = $this->model->with('commentable')->findOrFail($id);

        return $comment;
    }

    public function getApprovedCommentsByPostId(int $postId, int $perPage = 15): LengthAwarePaginator
    {
        $resolvedPerPage = (int) request('per_page', $perPage);

        return $this->model
            ->where('commentable_type', Post::class)
            ->where('commentable_id', $postId)
            ->whereNull('parent_id')
            ->where('is_approved', true)
            ->with(['user', 'replies.user', 'replies.replies'])
            ->latest('id')
            ->paginate($resolvedPerPage);
    }

    public function getCommentsForModerator(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $resolvedPerPage = (int) ($filters['per_page'] ?? request('per_page', $perPage));
        $status = (string) ($filters['status'] ?? 'all');
        $keyword = trim((string) ($filters['keyword'] ?? ''));
        $commentableType = $this->resolveCommentableType($filters['commentable_type'] ?? null);
        $commentableId = isset($filters['commentable_id']) ? (int) $filters['commentable_id'] : null;

        return $this->baseModeratorQuery($userId, $commentableType, $commentableId)
            ->with([
                'user',
                'parent:id,body',
                'commentable' => fn($query) => $query->select('id', 'name', 'slug', 'user_id'),
            ])
            ->when($status === 'pending', fn(Builder $query) => $query->where('is_approved', false))
            ->when($status === 'approved', fn(Builder $query) => $query->where('is_approved', true))
            ->when($keyword !== '', function (Builder $query) use ($keyword) {
                $query->where(function (Builder $subQuery) use ($keyword) {
                    $subQuery
                        ->where('body', 'like', "%{$keyword}%")
                        ->orWhere('guest_name', 'like', "%{$keyword}%")
                        ->orWhere('guest_email', 'like', "%{$keyword}%")
                        ->orWhereHas('user', function (Builder $userQuery) use ($keyword) {
                            $userQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('email', 'like', "%{$keyword}%");
                        })
                        ->orWhereHasMorph('commentable', [Post::class, Page::class], function (Builder $contentQuery) use ($keyword) {
                            $contentQuery
                                ->where('name', 'like', "%{$keyword}%")
                                ->orWhere('slug', 'like', "%{$keyword}%");
                        });
                });
            })
            ->latest('id')
            ->paginate($resolvedPerPage);
    }

    public function countCommentsForModerator(int $userId, ?bool $isApproved = null, array $filters = []): int
    {
        $commentableType = $this->resolveCommentableType($filters['commentable_type'] ?? null);
        $commentableId = isset($filters['commentable_id']) ? (int) $filters['commentable_id'] : null;

        return $this->baseModeratorQuery($userId, $commentableType, $commentableId)
            ->when($isApproved !== null, fn(Builder $query) => $query->where('is_approved', $isApproved))
            ->count();
    }

    private function baseModeratorQuery(int $userId, ?string $commentableType = null, ?int $commentableId = null): Builder
    {
        $allowedTypes = $commentableType ? [$commentableType] : [Post::class, Page::class];

        return $this->model
            ->newQuery()
            ->whereIn('commentable_type', $allowedTypes)
            ->when($commentableId, fn(Builder $query) => $query->where('commentable_id', $commentableId))
            ->whereHasMorph('commentable', $allowedTypes, function (Builder $query) use ($userId) {
                $query->where('user_id', $userId);
            });
    }

    private function resolveCommentableType(mixed $commentableType): ?string
    {
        return match ($commentableType) {
            'post', Post::class => Post::class,
            'page', Page::class => Page::class,
            default => null,
        };
    }

    /**
     * Get allowed sorts for this repository.
     */
    public function getAllowedSorts(): array
    {
        return ['id', 'created_at', 'updated_at', 'is_approved'];
    }
}
