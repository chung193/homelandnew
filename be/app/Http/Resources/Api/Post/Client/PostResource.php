<?php

namespace App\Http\Resources\Api\Post\Client;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\Api\User\UserResource;
use App\Http\Resources\Api\Category\CategoryResource;
use App\Http\Resources\Api\Tag\TagResource;

/**
 * @mixin User
 */
class PostResource extends JsonResource
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
            'content' => $this->content,
            'user_id' => $this->user_id,
            'category_id' => $this->category_id,
            'status' => $this->status,
            'type' => $this->type,
            'views' => $this->views,
            'published_at' => $this->published_at,
            'featured' => $this->featured,
            'allow_comments' => $this->allow_comments,
            'avatar' => $this->avatar,
            'comments' => $this->comments,
            'user' => UserResource::make($this->user ?? []),
            'category' => CategoryResource::make($this->category),
            'tags' => TagResource::collection($this->whenLoaded('tags')),
        ];
    }
}
