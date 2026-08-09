<?php

namespace App\Repositories\Comment\Contracts;

use App\Models\Comment;
use App\Repositories\Base\Contracts\QueryableRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

interface CommentRepositoryInterface extends QueryableRepositoryInterface
{
    public function findCommentWithCommentable(int $id): Comment;
    public function getApprovedCommentsByPostId(int $postId, int $perPage = 15): LengthAwarePaginator;
    public function getCommentsForModerator(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function countCommentsForModerator(int $userId, ?bool $isApproved = null, array $filters = []): int;
}
