<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\PropertyTypeStoreRequest;
use App\Http\Requests\Api\V1\PropertyTypeUpdateRequest;
use App\Http\Resources\Api\PropertyType\PropertyTypeResource;
use App\Services\Contracts\PropertyTypeServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyTypeController extends BaseApiController
{
    public function __construct(protected readonly PropertyTypeServiceInterface $propertyTypeService) {}

    public function index(): JsonResponse
    {
        $propertyTypes = $this->propertyTypeService->getFilteredPropertyTypes(request(), 15);

        return $this->successResponse(PropertyTypeResource::collection($propertyTypes));
    }

    public function all(): JsonResponse
    {
        $propertyTypes = $this->propertyTypeService->getPropertyTypes();

        return $this->successResponse(PropertyTypeResource::collection($propertyTypes));
    }

    public function show(int $id): JsonResponse
    {
        $propertyType = $this->propertyTypeService->getPropertyTypeById($id);

        return $this->successResponse(new PropertyTypeResource($propertyType));
    }

    public function store(PropertyTypeStoreRequest $request): JsonResponse
    {
        $propertyType = $this->propertyTypeService->createPropertyType($request->validated());

        return $this->createdResponse(new PropertyTypeResource($propertyType));
    }

    public function update(PropertyTypeUpdateRequest $request, int $id): JsonResponse
    {
        $propertyType = $this->propertyTypeService->updatePropertyType($id, $request->validated());

        return $this->successResponse(new PropertyTypeResource($propertyType));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->propertyTypeService->deletePropertyType($id);

        return $this->noContentResponse();
    }

    public function active(): JsonResponse
    {
        $propertyTypes = $this->propertyTypeService->getActivePropertyTypes();

        return $this->successResponse(PropertyTypeResource::collection($propertyTypes));
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:property_types,id'],
        ]);

        $count = $this->propertyTypeService->deletePropertyTypes($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} property types successfully",
        ]);
    }
}
