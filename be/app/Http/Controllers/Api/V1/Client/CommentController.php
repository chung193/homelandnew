<?php

namespace App\Http\Controllers\Api\V1\Client;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Api\Comment\Client\CommentResource;
use App\Models\Comment;
use App\Models\Post;
use App\Services\Client\Contracts\CommentServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends BaseApiController
{
    public function __construct(
        protected readonly CommentServiceInterface $commentService
    ) {}

    public function indexByPost(Request $request, string $post_slug): JsonResponse
    {
        $post = Post::query()->where('slug', $post_slug)->firstOrFail();

        $validated = $request->validate([
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $comments = $this->commentService->getApprovedCommentsByPostId(
            (int) $post->id,
            (int) ($validated['per_page'] ?? 15)
        );

        return $this->successResponse(CommentResource::collection($comments));
    }

    public function myComments(Request $request): JsonResponse
    {
        $authUser = auth('api')->user() ?? $request->user();
        if (! $authUser) {
            return $this->unauthorizedResponse('Login required to view your comments');
        }

        $comments = Comment::query()
            ->where('user_id', (int) $authUser->id)
            ->where('commentable_type', Post::class)
            ->with([
                'user',
                'commentable' => fn ($query) => $query->select('id', 'name', 'slug'),
            ])
            ->latest('id')
            ->get();

        return $this->successResponse(CommentResource::collection($comments));
    }

    public function storeByPost(Request $request, string $post_slug): JsonResponse
    {
        $post = Post::query()->where('slug', $post_slug)->firstOrFail();
        $authUser = auth('api')->user() ?? $request->user();

        $rules = [
            'body' => ['required', 'string', 'min:3', 'max:5000'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
            'guest_name' => ['nullable', 'string', 'max:120'],
            'guest_email' => ['nullable', 'email', 'max:255'],
        ];

        $validated = $request->validate($rules);

        $payload = [
            'body' => $validated['body'],
            'post_id' => (int) $post->id,
            'parent_id' => $validated['parent_id'] ?? null,
            'guest_name' => $validated['guest_name'] ?? null,
            'guest_email' => $validated['guest_email'] ?? null,
        ];

        $comment = $this->commentService->createComment($payload, (int) (optional($authUser)->id ?: 0) ?: null);

        return $this->createdResponse([
            'message' => $comment->is_approved
                ? 'Comment created successfully'
                : 'Comment submitted successfully and is awaiting approval',
            'comment' => CommentResource::make($comment),
        ]);
    }

    /**
     * Store a newly created comment in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $authUser = auth('api')->user() ?? $request->user();

        $rules = [
            'body' => ['required', 'string', 'min:3', 'max:5000'],
            'post_id' => ['required', 'integer', 'exists:posts,id'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
            'guest_name' => ['nullable', 'string', 'max:120'],
            'guest_email' => ['nullable', 'email', 'max:255'],
        ];

        $validated = $request->validate($rules);

        $comment = $this->commentService->createComment($validated, (int) (optional($authUser)->id ?: 0) ?: null);

        return $this->createdResponse([
            'message' => $comment->is_approved
                ? 'Comment created successfully'
                : 'Comment submitted successfully and is awaiting approval',
            'comment' => CommentResource::make($comment),
        ]);
    }

    /**
     * Update the specified comment in storage.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $authUser = auth('api')->user() ?? $request->user();
        if (!$authUser) {
            return $this->unauthorizedResponse('Login required to update comment');
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:3', 'max:5000'],
        ]);

        $comment = $this->commentService->updateComment($id, $validated, (int) $authUser->id);

        return $this->successResponse([
            'message' => 'Comment updated successfully',
            'comment' => CommentResource::make($comment),
        ]);
    }

    /**
     * Remove the specified comment from storage.
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $authUser = auth('api')->user() ?? $request->user();
        if (!$authUser) {
            return $this->unauthorizedResponse('Login required to delete comment');
        }

        $this->commentService->deleteComment($id, (int) $authUser->id);

        return $this->noContentResponse();
    }

    /**
     * Approve a comment by post owner.
     */
    public function approve(Request $request, int $id): JsonResponse
    {
        $authUser = auth('api')->user() ?? $request->user();
        if (!$authUser) {
            return $this->unauthorizedResponse('Login required to approve comment');
        }

        $comment = $this->commentService->approveComment($id, (int) $authUser->id);

        return $this->successResponse([
            'message' => 'Comment approved successfully',
            'comment' => CommentResource::make($comment),
        ]);
    }
}
