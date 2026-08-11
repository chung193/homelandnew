<?php

namespace App\Http\Controllers\Api\V1\JsonApi;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Property;
use App\Services\Contracts\PropertyServiceInterface;
use Illuminate\Http\Request;

class PropertyJsonApiController extends BaseApiController
{
    public function __construct(private readonly PropertyServiceInterface $propertyService) {}

    public function index(Request $request)
    {
        $properties = $this->propertyService->getPublicProperties($request, 12);

        return response()->json([
            'jsonapi' => ['version' => '1.0'],
            'data' => $properties->getCollection()->map(function (Property $property) {
                $featuredImageUrl = $property->getFirstMediaUrl('featured_image');
                $galleryPreviewUrl = $property->getFirstMediaUrl('gallery', 'preview');
                $galleryImageUrl = $property->getFirstMediaUrl('gallery');
                $representativeImage = $featuredImageUrl ?: ($galleryPreviewUrl ?: $galleryImageUrl);

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
                        'long-term-months' => $property->long_term_months,
                        'long-term-price' => $property->long_term_price,
                        'deposit-amount' => $property->deposit_amount,
                        'area' => $property->area,
                        'status' => $property->status,
                        'view-count' => (int) $property->views,
                        'featured-image' => $representativeImage ?: null,
                    ],
                    'relationships' => [
                        'property-type' => [
                            'data' => [
                                'type' => 'property-types',
                                'id' => (string) $property->propertyType?->getKey(),
                            ],
                        ],
                        'amenities' => [
                            'data' => $property->amenities->map(fn ($amenity) => [
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

    public function show(int $property)
    {
        $property = $this->propertyService->getPublicProperty($property);

        $gallery = $property->getMedia('gallery')->map(function ($media) {
            return [
                'type' => 'property-images',
                'id' => (string) $media->getKey(),
                'attributes' => [
                    'url' => $media->getFullUrl(),
                    'preview-url' => $media->getFullUrl('preview'),
                    'name' => $media->name,
                ],
            ];
        })->values();

        $featuredImageUrl = $property->getFirstMediaUrl('featured_image');

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
                    'long-term-months' => $property->long_term_months,
                    'long-term-price' => $property->long_term_price,
                    'deposit-amount' => $property->deposit_amount,
                    'area' => $property->area,
                    'status' => $property->status,
                    'view-count' => (int) $property->views,
                    'featured-image' => $featuredImageUrl ?: null,
                ],
                'relationships' => [
                    'property-type' => [
                        'data' => [
                            'type' => 'property-types',
                            'id' => (string) $property->propertyType?->getKey(),
                        ],
                    ],
                    'amenities' => [
                        'data' => $property->amenities->map(fn ($amenity) => [
                            'type' => 'amenities',
                            'id' => (string) $amenity->getKey(),
                        ])->values(),
                    ],
                    'images' => [
                        'data' => $gallery->map(fn ($image) => [
                            'type' => 'property-images',
                            'id' => $image['id'],
                        ])->values(),
                    ],
                ],
            ],
            'included' => [
                ...$property->amenities->map(fn ($amenity) => [
                    'type' => 'amenities',
                    'id' => (string) $amenity->getKey(),
                    'attributes' => [
                        'name' => $amenity->name,
                        'icon' => $amenity->icon,
                        'description' => $amenity->description,
                    ],
                ])->values()->all(),
                ...$gallery->all(),
            ],
        ]);
    }

    public function recordView(int $property)
    {
        return response()->json([
            'data' => ['views' => $this->propertyService->recordView($property)],
        ]);
    }
}
