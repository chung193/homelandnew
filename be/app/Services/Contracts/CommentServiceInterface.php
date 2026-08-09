<?php

namespace App\Services\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

interface CommentServiceInterface extends BaseServiceInterface
{
    public function getCommentsForModerator(int $userId, array $filters = [], int $perPage = 15): LengthAwarePaginator;
    public function getCommentStatsForModerator(int $userId, array $filters = []): array;
    public function approveComment(int $id, int $userId): Model;
    public function deleteComment(int $id, int $userId): bool;
    public function deleteComments(array $ids, int $userId): int;
}
