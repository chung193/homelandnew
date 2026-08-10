<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\ProvinceStoreRequest;
use App\Http\Requests\Api\V1\ProvinceUpdateRequest;
use App\Http\Resources\Api\Location\ProvinceResource;
use App\Models\Province;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProvinceController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $keyword = trim((string) $request->input('keyword', ''));
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));

        $query = Province::query();

        if ($keyword !== '') {
            $query->where(function ($builder) use ($keyword) {
                $builder
                    ->where('name', 'like', "%{$keyword}%")
                    ->orWhere('full_name', 'like', "%{$keyword}%")
                    ->orWhere('codename', 'like', "%{$keyword}%")
                    ->orWhere('code', 'like', "%{$keyword}%");
            });
        }

        $sort = (string) $request->input('sort', '-created_at');
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');
        $allowedSorts = ['id', 'code', 'name', 'order_level', 'created_at', 'updated_at'];

        if (! in_array($column, $allowedSorts, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        $provinces = $query->orderBy($column, $direction)->paginate($perPage);

        return $this->successResponse(ProvinceResource::collection($provinces));
    }

    public function show(int $province): JsonResponse
    {
        $model = Province::findOrFail($province);

        return $this->successResponse(new ProvinceResource($model));
    }

    public function store(ProvinceStoreRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['is_active'] = $payload['is_active'] ?? true;

        $province = Province::create($payload);

        return $this->createdResponse(new ProvinceResource($province));
    }

    public function update(ProvinceUpdateRequest $request, int $province): JsonResponse
    {
        $model = Province::findOrFail($province);
        $model->update($request->validated());

        return $this->successResponse(new ProvinceResource($model->fresh()));
    }

    public function destroy(int $province): JsonResponse
    {
        $model = Province::findOrFail($province);
        $model->delete();

        return $this->noContentResponse();
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:provinces,id'],
        ]);

        $count = Province::whereIn('id', $validated['ids'])->delete();

        return $this->successResponse([
            'message' => "Deleted {$count} provinces successfully",
        ]);
    }
}
