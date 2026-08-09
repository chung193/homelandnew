<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\Request;
use App\Http\Controllers\Api\BaseApiController;

class UploadFileController extends BaseApiController
{
    private function conversionUrl($media, string $conversion): ?string
    {
        $generated = (array) ($media->generated_conversions ?? []);
        if (!($generated[$conversion] ?? false)) {
            return null;
        }

        return $media->getFullUrl($conversion);
    }

    public function upload(Request $request)
    {
        try {
            $request->validate([
                'file' => 'required|file|max:10240',
                'model' => 'required|string', // User, Product, etc.
                'id' => 'required',
                'collection' => 'nullable|string', // attachments, avatar, gallery
            ]);

            $modelClass = "App\\Models\\{$request->model}";
            $model = $modelClass::findOrFail($request->id);
            $collection = $request->collection ?? 'attachments';

            if ($collection === 'avatar') {
                $model->clearMediaCollection($collection);
            }

            $media = $model
                ->addMediaFromRequest('file')
                ->toMediaCollection($collection);

            return response()->json([
                'message' => 'File uploaded successfully',
                'data' => [
                    'id' => $media->id,
                    'name' => $media->name,
                    'url' => $media->getFullUrl(),
                    'thumb' => $this->conversionUrl($media, 'thumb') ?? $this->conversionUrl($media, 'preview') ?? $media->getFullUrl(),
                    'medium' => $this->conversionUrl($media, 'medium'),
                    'large' => $this->conversionUrl($media, 'large'),
                    'collection' => $media->collection_name,
                ]
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Upload failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
