<?php

namespace App\Http\Resources\Api\Category;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Api\Category\CategoryResource;

/**
 * @mixin User
 */
class CategoryWithParentResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'parent_id' => $this->parent_id,
            'order' => $this->sort_order,
            'is_active' => $this->is_active,
            'parent' => CategoryResource::make($this->parent)
        ];
    }
}
