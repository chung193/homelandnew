<?php

namespace App\Http\Resources\Api\Comment\Client;

use App\Models\Comment;
use App\Http\Resources\Api\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Comment
 */
class CommentResource extends JsonResource
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
            'body' => $this->body,
            'user_id' => $this->user_id,
            'guest_name' => $this->guest_name,
            'guest_email' => $this->guest_email,
            'author_name' => $this->user?->name ?? $this->guest_name,
            'parent_id' => $this->parent_id,
            'is_approved' => (bool) $this->is_approved,
            'commentable_id' => $this->commentable_id,
            'commentable_type' => $this->commentable_type,
            'post_slug' => $this->commentable_type === \App\Models\Post::class ? $this->commentable?->slug : null,
            'post' => $this->commentable_type === \App\Models\Post::class && $this->relationLoaded('commentable')
                ? [
                    'id' => $this->commentable?->id,
                    'name' => $this->commentable?->name,
                    'slug' => $this->commentable?->slug,
                ]
                : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => UserResource::make($this->whenLoaded('user')),
            'replies' => self::collection($this->whenLoaded('replies')),
        ];
    }
}
