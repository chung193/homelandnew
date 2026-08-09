<?php

namespace App\Services\Client\Contracts;

use App\Services\Base\Contracts\BaseServiceInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Model;

interface CommentServiceInterface extends BaseServiceInterface
{
    public function getApprovedCommentsByPostId(int $postId, int $perPage = 15): LengthAwarePaginator;
    public function createComment(array $data, ?int $userId): Model;
    public function updateComment(int $id, array $data, int $userId): Model;
    public function deleteComment(int $id, int $userId): bool;
    public function approveComment(int $id, int $userId): Model;
}
