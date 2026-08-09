<?php

namespace App\JsonApi\V1\Resources;

use App\Models\Amenity;
use LaravelJsonApi\Core\Resources\JsonApiResource;

class AmenityResource extends JsonApiResource
{
    public static $model = Amenity::class;

    public function attributes($resource): array
    {
        return [
            'name' => $resource->name,
            'slug' => $resource->slug,
            'icon' => $resource->icon,
            'description' => $resource->description,
            'is-active' => (bool) $resource->is_active,
            'sort-order' => $resource->sort_order,
        ];
    }
}
