<?php

namespace App\JsonApi\V1\Resources;

use App\Models\Province;
use LaravelJsonApi\Core\Resources\JsonApiResource;

class ProvinceResource extends JsonApiResource
{
    public static $model = Province::class;

    public function attributes($resource): array
    {
        return [
            'code' => $resource->code,
            'name' => $resource->name,
            'name-en' => $resource->name_en,
            'full-name' => $resource->full_name,
            'full-name-en' => $resource->full_name_en,
            'division-type' => $resource->division_type,
            'codename' => $resource->codename,
            'phone-code' => $resource->phone_code,
            'order-level' => $resource->order_level,
            'is-active' => (bool) $resource->is_active,
        ];
    }
}
