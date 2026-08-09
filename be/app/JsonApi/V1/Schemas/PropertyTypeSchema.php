<?php

namespace App\JsonApi\V1\Schemas;

use App\Models\PropertyType;
use LaravelJsonApi\Core\Schema\Schema;

class PropertyTypeSchema extends Schema
{
    public static string $model = PropertyType::class;

    public function fields(): array
    {
        return [
            'name' => $this->stringField(),
            'slug' => $this->stringField(),
            'description' => $this->stringField(),
            'is-active' => $this->booleanField(),
            'sort-order' => $this->numberField(),
        ];
    }

    public function relationships(): array
    {
        return [
            'amenities' => $this->hasMany(),
        ];
    }
}
