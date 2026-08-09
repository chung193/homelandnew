<?php

namespace App\JsonApi\V1\Schemas;

use App\Models\Amenity;
use LaravelJsonApi\Core\Schema\Schema;

class AmenitySchema extends Schema
{
    public static string $model = Amenity::class;

    public function fields(): array
    {
        return [
            'name' => $this->stringField(),
            'slug' => $this->stringField(),
            'icon' => $this->stringField(),
            'description' => $this->stringField(),
            'is-active' => $this->booleanField(),
            'sort-order' => $this->numberField(),
        ];
    }
}
