<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\PostImportWordpressRequest;
use App\Http\Requests\Api\V1\PostStoreRequest;
use App\Http\Requests\Api\V1\PostUpdateRequest;
use App\Http\Resources\Api\Post\PostResource;
use App\Http\Resources\Api\Post\PostWithCategoryUserResource;
use App\Models\User;
use App\Services\Contracts\PostServiceInterface;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PostExport;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use App\Models\Post;

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
    public function index(): JsonResponse
    {
        $posts = $this->postService->getFilteredPosts(request());
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
    public function show(int $id): JsonResponse
    {
        $post = $this->postService->getPostById($id);

        return $this->successResponse(new PostResource($post));
    }

    private function generateUniqueSlug($title): string
    {
        $slug = Str::slug($title);
        $originalSlug = $slug;
        $i = 1;

        while (Post::where('slug', $slug)->exists()) {
            $slug = $originalSlug . '-' . $i;
            $i++;
        }

        return $slug;
    }

    /**
     * Store a newly created post in storage.
     */
    public function store(PostStoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user = $request->user();

        $data['user_id'] = $user->id;

        // Nếu không gửi slug thì tự tạo
        if (empty($data['slug'])) {
            $data['slug'] = $this->generateUniqueSlug($data['name']);
        }

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

    public function importWordpressXml(PostImportWordpressRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $userId = (int) ($validated['user_id'] ?? optional($request->user())->id ?? 0);
        if ($userId <= 0) {
            $userId = (int) (User::query()->value('id') ?? 0);
        }

        if ($userId <= 0) {
            return $this->errorResponse(
                'No user found for import. Create a user first or pass user_id in form-data.',
                422
            );
        }

        $summary = $this->postService->importWordpressXml(
            $request->file('file'),
            $userId,
            [
                'default_status' => $validated['default_status'] ?? 'draft',
                'default_type' => $validated['default_type'] ?? 'article',
                'skip_existing' => $request->boolean('skip_existing', true),
                'allow_comments' => $request->boolean('allow_comments', true),
                'featured' => $request->boolean('featured', false),
            ]
        );

        return $this->successResponse([
            'message' => 'WordPress posts imported successfully',
            'summary' => $summary,
        ]);
    }
}
