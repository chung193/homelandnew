<?php

namespace App\Http\Resources\Api\Comment;

use App\Http\Resources\Api\User\UserResource;
use App\Models\Comment;
use App\Models\Page;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Comment
 */
class CommentModerationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $commentableType = match (true) {
            $this->commentable instanceof Post => 'post',
            $this->commentable instanceof Page => 'page',
            default => null,
        };

        $commentable = $this->commentable ? [
            'id' => $this->commentable->id,
            'name' => $this->commentable->name,
            'slug' => $this->commentable->slug,
            'type' => $commentableType,
        ] : null;

        return [
            'id' => $this->id,
            'body' => $this->body,
            'user_id' => $this->user_id,
            'guest_name' => $this->guest_name,
            'guest_email' => $this->guest_email,
            'author_name' => $this->user?->name ?? $this->guest_name ?? 'Anonymous',
            'author_email' => $this->user?->email ?? $this->guest_email,
            'parent_id' => $this->parent_id,
            'parent_body' => $this->parent?->body,
            'is_approved' => (bool) $this->is_approved,
            'commentable_type' => $commentableType,
            'commentable' => $commentable,
            'post' => $commentableType === 'post' ? $commentable : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'user' => UserResource::make($this->whenLoaded('user')),
        ];
    }
}
