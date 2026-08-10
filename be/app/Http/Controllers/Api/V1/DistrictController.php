<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\DistrictStoreRequest;
use App\Http\Requests\Api\V1\DistrictUpdateRequest;
use App\Http\Resources\Api\Location\DistrictResource;
use App\Models\District;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DistrictController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $keyword = trim((string) $request->input('keyword', ''));
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));

        $query = District::query();

        if ($request->filled('province_code')) {
            $query->where('province_code', (int) $request->input('province_code'));
        }

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
        $allowedSorts = ['id', 'province_code', 'code', 'name', 'created_at', 'updated_at'];

        if (! in_array($column, $allowedSorts, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        $districts = $query->orderBy($column, $direction)->paginate($perPage);

        return $this->successResponse(DistrictResource::collection($districts));
    }

    public function show(int $district): JsonResponse
    {
        $model = District::findOrFail($district);

        return $this->successResponse(new DistrictResource($model));
    }

    public function store(DistrictStoreRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['is_active'] = $payload['is_active'] ?? true;

        $district = District::create($payload);

        return $this->createdResponse(new DistrictResource($district));
    }

    public function update(DistrictUpdateRequest $request, int $district): JsonResponse
    {
        $model = District::findOrFail($district);
        $model->update($request->validated());

        return $this->successResponse(new DistrictResource($model->fresh()));
    }

    public function destroy(int $district): JsonResponse
    {
        $model = District::findOrFail($district);
        $model->delete();

        return $this->noContentResponse();
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:districts,id'],
        ]);

        $count = District::whereIn('id', $validated['ids'])->delete();

        return $this->successResponse([
            'message' => "Deleted {$count} districts successfully",
        ]);
    }
}
