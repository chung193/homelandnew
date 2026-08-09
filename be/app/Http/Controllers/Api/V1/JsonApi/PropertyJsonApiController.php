<?php

namespace App\Http\Controllers\Api\V1\JsonApi;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Property;
use Illuminate\Http\Request;

class PropertyJsonApiController extends BaseApiController
{
    public function index()
    {
        $properties = Property::query()
            ->with(['propertyType', 'amenities'])
            ->where('is_active', true)
            ->where('is_deleted', false)
            ->paginate(12);

        return response()->json([
            'jsonapi' => ['version' => '1.0'],
            'data' => $properties->getCollection()->map(function (Property $property) {
                return [
                    'type' => 'properties',
                    'id' => (string) $property->getKey(),
                    'attributes' => [
                        'title' => $property->title,
                        'listing-type' => $property->listing_type,
                        'description' => $property->description,
                        'address' => $property->address,
                        'city' => $property->city,
                        'district' => $property->district,
                        'ward' => $property->ward,
                        'price' => $property->price,
                        'price-unit' => $property->price_unit,
                        'area' => $property->area,
                        'status' => $property->status,
                    ],
                    'relationships' => [
                        'property-type' => [
                            'data' => [
                                'type' => 'property-types',
                                'id' => (string) $property->propertyType?->getKey(),
                            ],
                        ],
                        'amenities' => [
                            'data' => $property->amenities->map(fn($amenity) => [
                                'type' => 'amenities',
                                'id' => (string) $amenity->getKey(),
                            ])->values(),
                        ],
                    ],
                ];
            })->values(),
            'meta' => [
                'current_page' => $properties->currentPage(),
                'per_page' => $properties->perPage(),
                'total' => $properties->total(),
            ],
        ]);
    }

    public function show(Property $property)
    {
        return response()->json([
            'jsonapi' => ['version' => '1.0'],
            'data' => [
                'type' => 'properties',
                'id' => (string) $property->getKey(),
                'attributes' => [
                    'title' => $property->title,
                    'listing-type' => $property->listing_type,
                    'description' => $property->description,
                    'address' => $property->address,
                    'city' => $property->city,
                    'district' => $property->district,
                    'ward' => $property->ward,
                    'price' => $property->price,
                    'price-unit' => $property->price_unit,
                    'area' => $property->area,
                    'status' => $property->status,
                ],
                'relationships' => [
                    'property-type' => [
                        'data' => [
                            'type' => 'property-types',
                            'id' => (string) $property->propertyType?->getKey(),
                        ],
                    ],
                    'amenities' => [
                        'data' => $property->amenities->map(fn($amenity) => [
                            'type' => 'amenities',
                            'id' => (string) $amenity->getKey(),
                        ])->values(),
                    ],
                ],
            ],
        ]);
    }
}
