<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\PropertyStoreRequest;
use App\Http\Requests\Api\V1\PropertyUpdateRequest;
use App\Http\Resources\Api\Property\PropertyResource;
use App\Services\Contracts\PropertyServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyController extends BaseApiController
{
    public function __construct(protected readonly PropertyServiceInterface $propertyService) {}

    public function index(): JsonResponse
    {
        $properties = $this->propertyService->getFilteredProperties(request(), 15);

        return $this->successResponse(PropertyResource::collection($properties));
    }

    public function all(): JsonResponse
    {
        $properties = $this->propertyService->getProperties();

        return $this->successResponse(PropertyResource::collection($properties));
    }

    public function show(int $id): JsonResponse
    {
        $property = $this->propertyService->getPropertyById($id);

        return $this->successResponse(new PropertyResource($property));
    }

    public function store(PropertyStoreRequest $request): JsonResponse
    {
        $property = $this->propertyService->createProperty($request->validated());

        return $this->createdResponse(new PropertyResource($property));
    }

    public function update(PropertyUpdateRequest $request, int $id): JsonResponse
    {
        $property = $this->propertyService->updateProperty($id, $request->validated());

        return $this->successResponse(new PropertyResource($property));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->propertyService->deleteProperty($id);

        return $this->noContentResponse();
    }

    public function active(): JsonResponse
    {
        $properties = $this->propertyService->getActiveProperties();

        return $this->successResponse(PropertyResource::collection($properties));
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:properties,id'],
        ]);

        $count = $this->propertyService->deleteProperties($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} properties successfully",
        ]);
    }
}
