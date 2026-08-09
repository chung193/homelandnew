<?php

namespace App\Http\Controllers\Api\V1\Client;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\PostStoreRequest;
use App\Http\Requests\Api\V1\PostUpdateRequest;
use App\Http\Resources\Api\Post\Client\PostResource;
use App\Http\Resources\Api\Post\PostWithCategoryUserResource;
use App\Services\Client\Contracts\PostServiceInterface;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PostExport;
use Illuminate\Http\Request;

class PostController extends BaseApiController
{
    /**
     * PostController constructor.
     */
    public function __construct(
        protected readonly PostServiceInterface $postService
    ) {}

    /**
     * Display a listing of the posts with filtering, sorting, and pagination.
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category_slug' => ['nullable', 'string', 'exists:categories,slug'],
            'user_slug' => ['nullable', 'string'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'tag_slug' => ['nullable', 'string', 'exists:tags,slug'],
            'search' => ['nullable', 'string', 'max:255'],
            'keyword' => ['nullable', 'string', 'max:255'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $posts = $this->postService->getFilteredPosts($request);

        return $this->successResponse(PostWithCategoryUserResource::collection($posts));
    }

    /**
     * Display all posts.
     */
    public function all(): JsonResponse
    {
        $posts = $this->postService->getAllPosts();

        return $this->successResponse(PostResource::collection($posts));
    }

    /**
     * Display the specified post.
     */
    public function show(string $slug): JsonResponse
    {
        $post = $this->postService->getPostBySlug($slug);

        return $this->successResponse(new PostResource($post));
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(PostStoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user  = $request->user();
        $data['user_id'] = $user->id;
        $post = $this->postService->createPost($data);
        return $this->createdResponse(new PostResource($post));
    }

    /**
     * Update the specified post in storage.
     */
    public function update(PostUpdateRequest $request, int $id): JsonResponse
    {
        $post = $this->postService->updatePost($id, $request->validated());

        return $this->successResponse(new PostResource($post));
    }

    /**
     * Remove the specified post from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->postService->deletePost($id);

        return $this->noContentResponse();
    }

    /**
     * Remove the specified Users from storage.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:posts,id',
        ]);

        $count = $this->postService->deletePosts($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} pages successfully"
        ]);
    }

    /**
     * Display a listing of active posts.
     */
    public function active(): JsonResponse
    {
        $posts = $this->postService->getActivePosts();

        return $this->successResponse(PostResource::collection($posts));
    }

    public function postCount(): JsonResponse
    {
        $count = $this->postService->getPostsCount();

        return $this->successResponse($count);
    }

    public function export()
    {
        return Excel::download(new PostExport(), 'posts.xlsx');
    }
}
