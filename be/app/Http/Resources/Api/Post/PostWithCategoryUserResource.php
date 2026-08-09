<?php

namespace App\Http\Resources\Api\Post;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Api\User\UserResource;
use App\Http\Resources\Api\Category\CategoryResource;
use App\Http\Resources\Api\Tag\TagResource;

/**
 * @mixin Post
 */
class PostWithCategoryUserResource extends JsonResource
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
            'avatar' => $this->avatar,
            'description' => $this->description,
            'content' => $this->content,
            'user_id' => $this->user_id,
            'category_id' => $this->category_id,
            'status' => $this->status,
            'type' => $this->type,
            'views' => $this->views,
            'published_at' => $this->published_at,
            'featured' => $this->featured,
            'allow_comments' => $this->allow_comments,
            'comments_count' => (int) ($this->comments_count ?? 0),
            'featured_media_id' => $featuredMedia?->id,
            'featured_media' => $featuredMedia ? [
                'id' => $featuredMedia->id,
                'url' => $featuredMedia->getFullUrl(),
                'thumb' => $featuredMedia->getFullUrl('preview'),
                'name' => $featuredMedia->name,
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => UserResource::make($this->user ?? []),
            'category' => CategoryResource::make($this->category),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
