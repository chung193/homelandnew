<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\CategoryStoreRequest;
use App\Http\Requests\Api\V1\CategoryUpdateRequest;
use App\Http\Resources\Api\Category\CategoryResource;
use App\Http\Resources\Api\Category\CategoryWithParentResource;
use App\Services\Contracts\CategoryServiceInterface;
use Illuminate\Http\JsonResponse;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\CategoryExport;
use Illuminate\Http\Request;

class CategoryController extends BaseApiController
{
    /**
     * CategoryController constructor.
     */
    public function __construct(
        protected readonly CategoryServiceInterface $categoryService
    ) {}

    /**
     * Display a listing of the categorys with filtering, sorting, and pagination.
     */
    public function index(): JsonResponse
    {
        $categories = $this->categoryService->getFilteredCategories(request());

        return $this->successResponse(CategoryWithParentResource::collection($categories));
    }

    /**
     * Display all categorys.
     */
    public function all(): JsonResponse
    {
        $categories = $this->categoryService->getAllCategories();

        return $this->successResponse(CategoryResource::collection($categories));
    }

    /**
     * Display the specified category.
     */
    public function show(int $id): JsonResponse
    {
        $category = $this->categoryService->getCategoryById($id);

        return $this->successResponse(new CategoryResource($category));
    }

    /**
     * Store a newly created category in storage.
     */
    public function store(CategoryStoreRequest $request): JsonResponse
    {
        $category = $this->categoryService->createCategory($request->validated());

        return $this->createdResponse(new CategoryResource($category));
    }

    /**
     * Update the specified category in storage.
     */
    public function update(CategoryUpdateRequest $request, int $id): JsonResponse
    {
        $category = $this->categoryService->updateCategory($id, $request->validated());

        return $this->successResponse(new CategoryResource($category));
    }

    /**
     * Remove the specified category from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $this->categoryService->deleteCategory($id);

        return $this->noContentResponse();
    }

    /**
     * Display a listing of active categorys.
     */
    public function active(): JsonResponse
    {
        $categories = $this->categoryService->getActiveCategories();

        return $this->successResponse(CategoryResource::collection($categories));
    }

    /**
     * Remove the specified Users from storage.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:categories,id',
        ]);

        $count = $this->categoryService->deleteCategories($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} categories successfully"
        ]);
    }


    public function export()
    {
        return Excel::download(new CategoryExport(), 'categories.xlsx');
    }
}
