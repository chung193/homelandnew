<?php

namespace App\Services\Client\Concretes;

use App\Models\Comment;
use App\Models\Post;
use App\Models\User;
use App\Repositories\Comment\Contracts\CommentRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Client\Contracts\CommentServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CommentService extends BaseService implements CommentServiceInterface
{
    public function __construct(protected CommentRepositoryInterface $commentRepository)
    {
        $this->setRepository($commentRepository);
    }

    public function createComment(array $data, ?int $userId): Model
    {
        $post = Post::query()->findOrFail((int) $data['post_id']);

        if (!$post->allow_comments) {
            throw new HttpException(422, 'Comments are disabled for this post');
        }

        $parentId = isset($data['parent_id']) ? (int) $data['parent_id'] : null;
        if ($parentId) {
            /** @var Comment $parent */
            $parent = $this->commentRepository->findOrFail($parentId);

            if (
                $parent->commentable_type !== Post::class ||
                (int) $parent->commentable_id !== (int) $post->id
            ) {
                throw new HttpException(422, 'Reply comment must belong to the same post');
            }
        }

        return $this->repository->create([
            'body' => $data['body'],
            'user_id' => $userId,
            'guest_name' => $userId ? null : ($data['guest_name'] ?? 'Anonymous'),
            'guest_email' => $userId ? null : ($data['guest_email'] ?? null),
            'commentable_id' => (int) $post->id,
            'commentable_type' => Post::class,
            'parent_id' => $parentId,
            'is_approved' => $this->shouldAutoApprove($userId),
        ])->load('user');
    }

    public function getApprovedCommentsByPostId(int $postId, int $perPage = 15): LengthAwarePaginator
    {
        $comments = $this->commentRepository->getApprovedCommentsByPostId($postId, $perPage);

        $comments->setCollection($this->filterApprovedComments($comments->getCollection()));

        return $comments;
    }

    public function updateComment(int $id, array $data, int $userId): Model
    {
        $comment = $this->repository->findOrFail($id);

        if ((int) $comment->user_id !== $userId) {
            throw new HttpException(403, 'You can only update your own comment');
        }

        return $this->repository->update($id, [
            'body' => $data['body'],
            'is_approved' => false,
        ])->load('user');
    }

    public function deleteComment(int $id, int $userId): bool
    {
        $comment = $this->repository->findOrFail($id);

        if ((int) $comment->user_id !== $userId) {
            throw new HttpException(403, 'You can only delete your own comment');
        }

        return $this->repository->delete($id);
    }

    public function approveComment(int $id, int $userId): Model
    {
        $comment = $this->commentRepository->findCommentWithCommentable($id);

        if ($comment->commentable_type !== Post::class || !($comment->commentable instanceof Post)) {
            throw new HttpException(422, 'Only post comments can be approved here');
        }

        if ((int) $comment->commentable->user_id !== $userId) {
            throw new HttpException(403, 'Only post owner can approve this comment');
        }

        return $this->repository->update($id, ['is_approved' => true])->load('user');
    }

    private function shouldAutoApprove(?int $userId): bool
    {
        if (!$userId) {
            return false;
        }

        $user = User::query()->find($userId);

        return $user?->isAdmin() ?? false;
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
}
