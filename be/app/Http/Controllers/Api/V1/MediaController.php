<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Api\Media\MediaResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class MediaController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $perPage = (int) $request->integer('per_page', 15);
        $keyword = trim((string) $request->get('keyword', ''));
        $collection = trim((string) $request->get('collection', ''));

        $query = Media::query()
            ->when($keyword !== '', function ($builder) use ($keyword) {
                $builder->where(function ($subQuery) use ($keyword) {
                    $subQuery
                        ->where('name', 'like', '%' . $keyword . '%')
                        ->orWhere('file_name', 'like', '%' . $keyword . '%')
                        ->orWhere('mime_type', 'like', '%' . $keyword . '%');
                });
            })
            ->when($collection !== '', function ($builder) use ($collection) {
                $builder->where('collection_name', $collection);
            })
            ->latest('created_at');

        $medias = $query->paginate(max($perPage, 1));

        return $this->successResponse(MediaResource::collection($medias));
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'file' => ['required', 'file', 'max:10240'],
            'name' => ['nullable', 'string', 'max:255'],
            'collection' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $collection = $validated['collection'] ?? 'library';

        $mediaAdder = $user->addMediaFromRequest('file');
        if (!empty($validated['name'])) {
            $mediaAdder->usingName($validated['name']);
        }

        $media = $mediaAdder->toMediaCollection($collection);

        return $this->createdResponse(new MediaResource($media));
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
        ]);

        $media = Media::query()->findOrFail($id);
        $media->name = $validated['name'];
        $media->save();

        return $this->successResponse(new MediaResource($media));
    }

    public function destroy(int $id): JsonResponse
    {
        $media = Media::query()->findOrFail($id);
        $media->delete();

        return $this->noContentResponse();
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:media,id'],
        ]);

        $count = 0;
        $medias = Media::query()->whereIn('id', $validated['ids'])->get();
        foreach ($medias as $media) {
            $media->delete();
            $count++;
        }

        return $this->successResponse([
            'message' => "Deleted {$count} medias successfully",
        ]);
    }
}
