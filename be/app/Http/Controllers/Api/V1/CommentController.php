<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Api\Comment\CommentModerationResource;
use App\Services\Contracts\CommentServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends BaseApiController
{
    public function __construct(
        protected readonly CommentServiceInterface $commentService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'keyword' => ['nullable', 'string', 'max:255'],
            'status' => ['nullable', 'in:all,pending,approved'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'commentable_type' => ['nullable', 'in:post,page'],
            'commentable_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $comments = $this->commentService->getCommentsForModerator(
            (int) $request->user()->id,
            $validated,
            (int) ($validated['per_page'] ?? 15)
        );

        return $this->successResponse(CommentModerationResource::collection($comments));
    }

    public function count(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'commentable_type' => ['nullable', 'in:post,page'],
            'commentable_id' => ['nullable', 'integer', 'min:1'],
        ]);

        return $this->successResponse(
            $this->commentService->getCommentStatsForModerator((int) $request->user()->id, $validated)
        );
    }

    public function approve(Request $request, int $id): JsonResponse
    {
        $comment = $this->commentService->approveComment($id, (int) $request->user()->id);

        return $this->successResponse([
            'message' => 'Comment approved successfully',
            'comment' => CommentModerationResource::make($comment),
        ]);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $this->commentService->deleteComment($id, (int) $request->user()->id);

        return $this->noContentResponse();
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:comments,id'],
        ]);

        $count = $this->commentService->deleteComments($validated['ids'], (int) $request->user()->id);

        return $this->successResponse([
            'message' => "Deleted {$count} comments successfully",
        ]);
    }
}
