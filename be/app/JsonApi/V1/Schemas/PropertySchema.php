<?php

namespace App\JsonApi\V1\Schemas;

use App\Models\Property;
use LaravelJsonApi\Core\Schema\Schema;

class PropertySchema extends Schema
{
    public static string $model = Property::class;

    public function fields(): array
    {
        return [
            'title' => $this->stringField(),
            'listing-type' => $this->stringField(),
            'description' => $this->stringField(),
            'address' => $this->stringField(),
            'city' => $this->stringField(),
            'district' => $this->stringField(),
            'ward' => $this->stringField(),
            'price' => $this->numberField(),
            'price-unit' => $this->stringField(),
            'area' => $this->numberField(),
            'bedrooms' => $this->numberField(),
            'bathrooms' => $this->numberField(),
            'floor' => $this->numberField(),
            'legal-info' => $this->stringField(),
            'status' => $this->stringField(),
            'is-active' => $this->booleanField(),
            'is-deleted' => $this->booleanField(),
            'qr-code' => $this->stringField(),
            'created-at' => $this->dateTimeField(),
            'updated-at' => $this->dateTimeField(),
        ];
    }

    public function relationships(): array
    {
        return [
            'user' => $this->belongsTo(),
            'property-type' => $this->belongsTo(),
            'amenities' => $this->hasMany(),
        ];
    }
}
