<?php

namespace App\Http\Resources\Api\Media;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    private function conversionUrl(string $conversion): ?string
    {
        $generated = (array) ($this->generated_conversions ?? []);
        if (!($generated[$conversion] ?? false)) {
            return null;
        }

        return $this->getFullUrl($conversion);
    }

    public function toArray(Request $request): array
    {
        $isImage = is_string($this->mime_type) && str_starts_with($this->mime_type, 'image/');

        return [
            'id' => $this->id,
            'name' => $this->name,
            'file_name' => $this->file_name,
            'mime_type' => $this->mime_type,
            'size' => $this->size,
            'collection_name' => $this->collection_name,
            'model_type' => $this->model_type,
            'model_id' => $this->model_id,
            'url' => $this->getFullUrl(),
            'thumb' => $isImage ? ($this->conversionUrl('thumb') ?? $this->conversionUrl('preview') ?? $this->getFullUrl()) : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
