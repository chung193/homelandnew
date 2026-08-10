<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\WardStoreRequest;
use App\Http\Requests\Api\V1\WardUpdateRequest;
use App\Http\Resources\Api\Location\WardResource;
use App\Models\Ward;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class WardController extends BaseApiController
{
    public function index(Request $request): JsonResponse
    {
        $keyword = trim((string) $request->input('keyword', ''));
        $perPage = max(1, min((int) $request->input('per_page', 15), 100));

        $query = Ward::query();

        if ($request->filled('province_code')) {
            $query->where('province_code', (int) $request->input('province_code'));
        }

        if ($request->filled('district_code')) {
            $query->where('district_code', (int) $request->input('district_code'));
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
        $allowedSorts = ['id', 'province_code', 'district_code', 'code', 'name', 'created_at', 'updated_at'];

        if (! in_array($column, $allowedSorts, true)) {
            $column = 'created_at';
            $direction = 'desc';
        }

        $wards = $query->orderBy($column, $direction)->paginate($perPage);

        return $this->successResponse(WardResource::collection($wards));
    }

    public function show(int $ward): JsonResponse
    {
        $model = Ward::findOrFail($ward);

        return $this->successResponse(new WardResource($model));
    }

    public function store(WardStoreRequest $request): JsonResponse
    {
        $payload = $request->validated();
        $payload['is_active'] = $payload['is_active'] ?? true;

        $ward = Ward::create($payload);

        return $this->createdResponse(new WardResource($ward));
    }

    public function update(WardUpdateRequest $request, int $ward): JsonResponse
    {
        $model = Ward::findOrFail($ward);
        $model->update($request->validated());

        return $this->successResponse(new WardResource($model->fresh()));
    }

    public function destroy(int $ward): JsonResponse
    {
        $model = Ward::findOrFail($ward);
        $model->delete();

        return $this->noContentResponse();
    }

    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['integer', 'exists:wards,id'],
        ]);

        $count = Ward::whereIn('id', $validated['ids'])->delete();

        return $this->successResponse([
            'message' => "Deleted {$count} wards successfully",
        ]);
    }
}
