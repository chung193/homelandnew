<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Property;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SavedPropertyController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $properties = $request->user()->savedProperties()
            ->with('media')
            ->active()
            ->where('status', 'published')
            ->orderByDesc('saved_properties.created_at')
            ->get();

        return $this->successResponse($properties->map(fn (Property $property) => $this->card($property))->values());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['property_id' => ['required', 'integer', 'exists:properties,id']]);
        $property = Property::query()->active()->where('status', 'published')->findOrFail($data['property_id']);
        $request->user()->savedProperties()->syncWithoutDetaching([$property->id]);

        return $this->successResponse(['property_id' => (string) $property->id, 'saved' => true]);
    }

    public function destroy(Request $request, Property $property): JsonResponse
    {
        $request->user()->savedProperties()->detach($property->id);
        return $this->successResponse(['property_id' => (string) $property->id, 'saved' => false]);
    }

    private function card(Property $property): array
    {
        $featured = $property->getFirstMediaUrl('featured_image');
        $gallery = $property->getFirstMediaUrl('gallery', 'preview') ?: $property->getFirstMediaUrl('gallery');

        return [
            'type' => 'properties',
            'id' => (string) $property->id,
            'attributes' => [
                'title' => $property->title,
                'address' => $property->address,
                'city' => $property->city,
                'district' => $property->district,
                'ward' => $property->ward,
                'price' => $property->price,
                'price-unit' => $property->price_unit,
                'area' => $property->area,
                'created_at' => $property->created_at?->toISOString(),
                'featured-image' => $featured ?: ($gallery ?: null),
            ],
        ];
    }
}
