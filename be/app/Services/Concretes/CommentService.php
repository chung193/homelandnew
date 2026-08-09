<?php

namespace App\Services\Concretes;

use App\Models\Comment;
use App\Models\Page;
use App\Models\Post;
use App\Repositories\Comment\Contracts\CommentRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\CommentServiceInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;
use Symfony\Component\HttpKernel\Exception\HttpException;

class CommentService extends BaseService implements CommentServiceInterface
{
    public function __construct(protected CommentRepositoryInterface $commentRepository)
    {
        $this->setRepository($commentRepository);
    }

    public function getCommentsForModerator(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->commentRepository->getCommentsForModerator($userId, $filters, $perPage);
    }

    public function getCommentStatsForModerator(int $userId, array $filters = []): array
    {
        return [
            'total' => $this->commentRepository->countCommentsForModerator($userId, null, $filters),
            'pending' => $this->commentRepository->countCommentsForModerator($userId, false, $filters),
            'approved' => $this->commentRepository->countCommentsForModerator($userId, true, $filters),
        ];
    }

    public function approveComment(int $id, int $userId): Model
    {
        $comment = $this->getCommentForModerator($id, $userId);

        return $this->repository->update($comment->id, ['is_approved' => true])
            ->load(['user', 'parent', 'commentable']);
    }

    public function deleteComment(int $id, int $userId): bool
    {
        $comment = $this->getCommentForModerator($id, $userId);

        return $this->repository->delete($comment->id);
    }

    public function deleteComments(array $ids, int $userId): int
    {
        $deleted = 0;

        foreach ($ids as $id) {
            if ($this->deleteComment((int) $id, $userId)) {
                $deleted++;
            }
        }

        return $deleted;
    }

    private function getCommentForModerator(int $id, int $userId): Comment
    {
        /** @var Comment $comment */
        $comment = $this->commentRepository->findCommentWithCommentable($id);

        if (!in_array($comment->commentable_type, [Post::class, Page::class], true)) {
            throw new HttpException(422, 'Only post/page comments can be moderated here');
        }

        if (!$comment->commentable || (int) $comment->commentable->user_id !== $userId) {
            throw new HttpException(403, 'You are not allowed to moderate this comment');
        }

        return $comment;
    }
}
