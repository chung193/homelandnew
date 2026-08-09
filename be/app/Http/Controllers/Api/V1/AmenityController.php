<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\AmenityStoreRequest;
use App\Http\Requests\Api\V1\AmenityUpdateRequest;
use App\Http\Resources\Api\Amenity\AmenityResource;
use App\Services\Contracts\AmenityServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AmenityController extends BaseApiController
{
    public function __construct(protected readonly AmenityServiceInterface $amenityService) {}

    public function index(): JsonResponse
    {
        $amenities = $this->amenityService->getFilteredAmenities(request(), 15);

        return $this->successResponse(AmenityResource::collection($amenities));
    }

    public function all(): JsonResponse
    {
        $amenities = $this->amenityService->getAmenities();

        if ($amenities->isEmpty()) {
            $amenities = collect([
                ['name' => 'Hồ bơi', 'slug' => 'ho-boi'],
                ['name' => 'Sân parking', 'slug' => 'san-parking'],
                ['name' => 'Máy lạnh', 'slug' => 'may-lanh'],
                ['name' => 'Camera', 'slug' => 'camera'],
                ['name' => 'Ban công', 'slug' => 'ban-cong'],
            ])->map(function (array $item) {
                return (object) array_merge($item, ['id' => null, 'is_active' => true]);
            });
        }

        return $this->successResponse(AmenityResource::collection($amenities));
    }

    public function show(int $id): JsonResponse
    {
        $amenity = $this->amenityService->getAmenityById($id);

        return $this->successResponse(new AmenityResource($amenity));
    }

    public function store(AmenityStoreRequest $request): JsonResponse
    {
        $amenity = $this->amenityService->createAmenity($request->validated());

        return $this->createdResponse(new AmenityResource($amenity));
    }

    public function update(AmenityUpdateRequest $request, int $id): JsonResponse
    {
        $amenity = $this->amenityService->updateAmenity($id, $request->validated());

        return $this->successResponse(new AmenityResource($amenity));
    }

    public function destroy(int $id): JsonResponse
    {
        $this->amenityService->deleteAmenity($id);

        return $this->noContentResponse();
    }

    public function active(): JsonResponse
    {
        $amenities = $this->amenityService->getActiveAmenities();

        return $this->successResponse(AmenityResource::collection($amenities));
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:amenities,id'],
        ]);

        $count = $this->amenityService->deleteAmenities($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} amenities successfully",
        ]);
    }
}
