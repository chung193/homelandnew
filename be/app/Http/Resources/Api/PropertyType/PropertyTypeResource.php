<?php

namespace App\Http\Resources\Api\PropertyType;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyTypeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'sort_order' => $this->sort_order,
            'icon' => $this->getFirstMediaUrl('icon', 'icon_thumb') ?: $this->getFirstMediaUrl('icon') ?: null,
            'amenities' => $this->whenLoaded('amenities', function () {
                return $this->amenities->map(function ($amenity) {
                    return [
                        'id' => $amenity->id,
                        'name' => $amenity->name,
                        'slug' => $amenity->slug,
                        'icon' => $amenity->icon,
                    ];
                });
            }),
            'amenity_ids' => $this->relationLoaded('amenities')
                ? $this->amenities->pluck('id')->values()->all()
                : [],
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
