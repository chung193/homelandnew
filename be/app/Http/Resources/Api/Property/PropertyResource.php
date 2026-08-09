<?php

namespace App\Http\Resources\Api\Property;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'property_type_id' => $this->property_type_id,
            'listing_type' => $this->listing_type,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'address' => $this->address,
            'city' => $this->city,
            'district' => $this->district,
            'ward' => $this->ward,
            'price' => $this->price,
            'price_unit' => $this->price_unit,
            'area' => $this->area,
            'bedrooms' => $this->bedrooms,
            'bathrooms' => $this->bathrooms,
            'floor' => $this->floor,
            'legal_info' => $this->legal_info,
            'status' => $this->status,
            'is_active' => $this->is_active,
            'is_deleted' => $this->is_deleted,
            'amenities' => $this->whenLoaded('amenities', function () {
                return $this->amenities->map(function ($amenity) {
                    return [
                        'id' => $amenity->id,
                        'name' => $amenity->name,
                        'slug' => $amenity->slug,
                    ];
                });
            }),
            'property_type' => $this->whenLoaded('propertyType', function () {
                return [
                    'id' => $this->propertyType->id,
                    'name' => $this->propertyType->name,
                    'slug' => $this->propertyType->slug,
                ];
            }),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
