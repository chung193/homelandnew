<?php

namespace App\Http\Controllers\Api\V1\Client;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Api\Category\CategoryResource;
use App\Services\Client\Contracts\CategoryServiceInterface;
use Illuminate\Http\JsonResponse;

class CategoryController extends BaseApiController
{
    /**
     * CategoryController constructor.
     */
    public function __construct(
        protected readonly CategoryServiceInterface $categoryService
    ) {}

    /**
     * Display all categories.
     */
    public function index(): JsonResponse
    {
        $categories = $this->categoryService->getAllCategories();

        return $this->successResponse(CategoryResource::collection($categories));
    }
}
