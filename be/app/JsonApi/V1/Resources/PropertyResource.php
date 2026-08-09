<?php

namespace App\JsonApi\V1\Resources;

use App\Models\Property;
use LaravelJsonApi\Core\Resources\JsonApiResource;

class PropertyResource extends JsonApiResource
{
    public static $model = Property::class;

    public function attributes($resource): array
    {
        return [
            'title' => $resource->title,
            'listing-type' => $resource->listing_type,
            'description' => $resource->description,
            'address' => $resource->address,
            'city' => $resource->city,
            'district' => $resource->district,
            'ward' => $resource->ward,
            'price' => $resource->price,
            'price-unit' => $resource->price_unit,
            'area' => $resource->area,
            'bedrooms' => $resource->bedrooms,
            'bathrooms' => $resource->bathrooms,
            'floor' => $resource->floor,
            'legal-info' => $resource->legal_info,
            'status' => $resource->status,
            'is-active' => (bool) $resource->is_active,
            'is-deleted' => (bool) $resource->is_deleted,
            'qr-code' => $resource->qr_code,
            'created-at' => $resource->created_at?->toJSON(),
            'updated-at' => $resource->updated_at?->toJSON(),
        ];
    }

    public function relationships($resource): array
    {
        return [
            'user' => [
                'data' => $resource->user,
                'links' => function () use ($resource) {
                    return ['/api/v1/properties/' . $resource->getRouteKey() . '/user'];
                },
            ],
            'property-type' => [
                'data' => $resource->propertyType,
            ],
            'amenities' => [
                'data' => $resource->amenities,
            ],
        ];
    }
}
