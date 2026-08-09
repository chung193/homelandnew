<?php

namespace App\Http\Controllers\Api\V1;

use App\Exports\TagExport;
use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\TagStoreRequest;
use App\Http\Requests\Api\V1\TagUpdateRequest;
use App\Http\Resources\Api\Tag\TagResource;
use App\Services\Contracts\TagServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class TagController extends BaseApiController
{
    /**
     * TagController constructor.
     */
    public function __construct(
        protected readonly TagServiceInterface $tagService
    ) {}

    /**
     * Display a listing of tags with filtering, sorting, and pagination.
     */
    public function index(): JsonResponse
    {
        $tags = $this->tagService->getFilteredTags(request());

        return $this->successResponse(TagResource::collection($tags));
    }

    /**
     * Display all tags.
     */
    public function all(): JsonResponse
    {
        $tags = $this->tagService->getAllTags();

        return $this->successResponse(TagResource::collection($tags));
    }

    /**
     * Display the specified tag.
     */
    public function show(int $id): JsonResponse
    {
        $tag = $this->tagService->getTagById($id);

        return $this->successResponse(new TagResource($tag));
    }

    /**
     * Store a newly created tag in storage.
     */
    public function store(TagStoreRequest $request): JsonResponse
    {
        $tag = $this->tagService->createTag($request->validated());

        return $this->createdResponse(new TagResource($tag));
    }

    /**
     * Update the specified tag in storage.
     */
    public function update(TagUpdateRequest $request, int $id): JsonResponse
    {
        $tag = $this->tagService->updateTag($id, $request->validated());

        return $this->successResponse(new TagResource($tag));
    }

    /**
     * Remove the specified tag from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->tagService->deleteTag($id);

        return $this->noContentResponse();
    }

    /**
     * Display a listing of active tags.
     */
    public function active(): JsonResponse
    {
        $tags = $this->tagService->getActiveTags();

        return $this->successResponse(TagResource::collection($tags));
    }

    /**
     * Remove specified tags from storage.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:tags,id',
        ]);

        $count = $this->tagService->deleteTags($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} tags successfully",
        ]);
    }

    public function export()
    {
        return Excel::download(new TagExport(), 'tags.xlsx');
    }
}
