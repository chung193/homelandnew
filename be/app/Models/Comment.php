<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Comment extends Model
{
    protected $fillable = ['body', 'user_id', 'guest_name', 'guest_email', 'commentable_id', 'commentable_type', 'parent_id', 'is_approved'];

    protected $casts = [
        'is_approved' => 'boolean',
    ];

    /**
     * Get the parent model (Post, Product, etc.)
     */
    public function commentable(): MorphTo
    {
        return $this->morphTo();
    }

    /**
     * Get comment author
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get parent comment (if reply)
     */
    public function parent(): BelongsTo
    {
        return $this->belongsTo(Comment::class, 'parent_id');
    }

    /**
     * Get replies to this comment
     */
    public function replies(): HasMany
    {
        return $this->hasMany(Comment::class, 'parent_id')
            ->with('user', 'replies');
    }

    /**
     * Check if this comment is a reply
     */
    public function isReply(): bool
    {
        return $this->parent_id !== null;
    }
}
