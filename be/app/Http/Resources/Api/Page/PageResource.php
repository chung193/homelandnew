<?php

namespace App\Http\Resources\Api\Page;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class PageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $featuredMedia = $this->getFirstMedia('cover');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'content' => $this->content,
            'user_id' => $this->user_id,
            'status' => $this->status,
            'type' => $this->type,
            'views' => $this->views,
            'published_at' => $this->published_at,
            'featured' => $this->featured,
            'allow_comments' => $this->allow_comments,
            'avatar' => $this->avatar,
            'featured_media_id' => $featuredMedia?->id,
            'featured_media' => $featuredMedia ? [
                'id' => $featuredMedia->id,
                'url' => $featuredMedia->getFullUrl(),
                'thumb' => $featuredMedia->getFullUrl('preview'),
                'name' => $featuredMedia->name,
            ] : null,
        ];
    }
}
