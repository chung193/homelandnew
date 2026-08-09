<?php

namespace App\JsonApi\V1\Resources;

use App\Models\Ward;
use LaravelJsonApi\Core\Resources\JsonApiResource;

class WardResource extends JsonApiResource
{
    public static $model = Ward::class;

    public function attributes($resource): array
    {
        return [
            'province-code' => $resource->province_code,
            'district-code' => $resource->district_code,
            'code' => $resource->code,
            'name' => $resource->name,
            'name-en' => $resource->name_en,
            'full-name' => $resource->full_name,
            'full-name-en' => $resource->full_name_en,
            'division-type' => $resource->division_type,
            'codename' => $resource->codename,
            'is-active' => (bool) $resource->is_active,
        ];
    }
}
