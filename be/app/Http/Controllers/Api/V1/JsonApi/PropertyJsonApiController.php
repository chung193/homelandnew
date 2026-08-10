<?php

namespace App\Http\Controllers\Api\V1\JsonApi;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\District;
use App\Models\Property;
use App\Models\Province;
use Illuminate\Http\Request;

class PropertyJsonApiController extends BaseApiController
{
    public function index(Request $request)
    {
        $query = Property::query()
            ->with(['propertyType', 'amenities', 'media'])
            ->where('is_active', true)
            ->where('is_deleted', false);

        $search = trim((string) $request->input('q', ''));
        if ($search !== '') {
            $query->where(function ($builder) use ($search) {
                $builder->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('district', 'like', "%{$search}%")
                    ->orWhere('ward', 'like', "%{$search}%");
            });
        }

        $propertyTypeId = (int) $request->input('property_type_id', 0);
        if ($propertyTypeId > 0) {
            $query->where('property_type_id', $propertyTypeId);
        }

        $provinceCode = (int) $request->input('province_code', 0);
        if ($provinceCode > 0) {
            $province = Province::query()
                ->where('code', $provinceCode)
                ->orWhere('id', $provinceCode)
                ->first();

            if ($province) {
                $query->where('city', 'like', "%{$province->name}%");
            }
        }

        $cityCode = (int) $request->input('city_code', 0);
        if ($cityCode > 0) {
            $district = District::query()
                ->where('code', $cityCode)
                ->orWhere('id', $cityCode)
                ->first();

            if ($district) {
                $query->where('district', 'like', "%{$district->name}%");
            }
        }

        $properties = $query->paginate(12);

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
                        'area' => $property->area,
                        'status' => $property->status,
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
        $property->loadMissing(['propertyType', 'amenities']);

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
                    'area' => $property->area,
                    'status' => $property->status,
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
                        'data' => $property->amenities->map(fn($amenity) => [
                            'type' => 'amenities',
                            'id' => (string) $amenity->getKey(),
                        ])->values(),
                    ],
                    'images' => [
                        'data' => $gallery->map(fn($image) => [
                            'type' => 'property-images',
                            'id' => $image['id'],
                        ])->values(),
                    ],
                ],
            ],
            'included' => [
                ...$property->amenities->map(fn($amenity) => [
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
}
