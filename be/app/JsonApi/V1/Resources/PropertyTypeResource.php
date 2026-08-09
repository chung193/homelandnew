<?php

namespace App\JsonApi\V1\Resources;

use App\Models\PropertyType;
use LaravelJsonApi\Core\Resources\JsonApiResource;

class PropertyTypeResource extends JsonApiResource
{
    public static $model = PropertyType::class;

    public function attributes($resource): array
    {
        return [
            'name' => $resource->name,
            'slug' => $resource->slug,
            'description' => $resource->description,
            'is-active' => (bool) $resource->is_active,
            'sort-order' => $resource->sort_order,
        ];
    }

    public function relationships($resource): array
    {
        return [
            'amenities' => [
                'data' => $resource->amenities,
            ],
        ];
    }
}
