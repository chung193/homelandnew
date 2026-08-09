<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\PageStoreRequest;
use App\Http\Requests\Api\V1\PageUpdateRequest;
use App\Http\Resources\Api\Page\PageResource;
use App\Http\Resources\Api\Page\PageWithUserResource;
use App\Services\Contracts\PageServiceInterface;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\PageExport;
use Illuminate\Http\Request;

class PageController extends BaseApiController
{
    /**
     * PageController constructor.
     */
    public function __construct(
        protected readonly PageServiceInterface $pageService
    ) {}

    /**
     * Display a listing of the pages with filtering, sorting, and pagination.
     */
    public function index(): JsonResponse
    {
        $pages = $this->pageService->getFilteredPages(request());

        return $this->successResponse(PageWithUserResource::collection($pages));
    }

    /**
     * Display all pages.
     */
    public function all(): JsonResponse
    {
        $pages = $this->pageService->getAllPages();

        return $this->successResponse(PageResource::collection($pages));
    }

    /**
     * Display the specified page.
     */
    public function show(int $id): JsonResponse
    {
        $page = $this->pageService->getPageById($id);

        return $this->successResponse(new PageResource($page));
    }

    /**
     * Store a newly created page in storage.
     */
    public function store(PageStoreRequest $request): JsonResponse
    {
        $data = $request->validated();
        $user  = $request->user();
        $data['user_id'] = $user->id;
        $page = $this->pageService->createPage($data);

        return $this->createdResponse(new PageResource($page));
    }

    /**
     * Update the specified page in storage.
     */
    public function update(PageUpdateRequest $request, int $id): JsonResponse
    {
        $page = $this->pageService->updatePage($id, $request->validated());

        return $this->successResponse(new PageResource($page));
    }

    /**
     * Remove the specified page from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->pageService->deletePage($id);

        return $this->noContentResponse();
    }

    /**
     * Display a listing of active pages.
     */
    public function active(): JsonResponse
    {
        $pages = $this->pageService->getActivePages();

        return $this->successResponse(PageResource::collection($pages));
    }


    /**
     * Remove the specified Users from storage.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:pages,id',
        ]);

        $count = $this->pageService->deletePages($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} pages successfully"
        ]);
    }

    public function export()
    {
        return Excel::download(new PageExport(), 'categories.xlsx');
    }
}
