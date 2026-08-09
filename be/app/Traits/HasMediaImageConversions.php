<?php

namespace App\Traits;

use Spatie\MediaLibrary\MediaCollections\Models\Media;

trait HasMediaImageConversions
{
    public function registerMediaConversions(Media $media = null): void
    {
        // Chỉ chạy khi là IMAGE
        if (! $media || ! str_starts_with($media->mime_type, 'image/')) {
            return;
        }

        // THUMB (avatar, list) - 150x150
        $this
            ->addMediaConversion('thumb')
            ->width(150)
            ->height(150)
            ->queued(false);

        // MEDIUM (preview) - max 600x600
        $this
            ->addMediaConversion('medium')
            ->width(600)
            ->height(600)
            ->queued(false);

        // LARGE (full view) - max 1200x1200
        $this
            ->addMediaConversion('large')
            ->width(1200)
            ->height(1200)
            ->queued(false);
    }
}
