<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\PermissionStoreRequest;
use App\Http\Requests\Api\V1\PermissionUpdateRequest;
use App\Http\Resources\Api\Permission\PermissionResource;
use App\Services\Contracts\PermissionServiceInterface;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Exports\PermissionExport;
use Maatwebsite\Excel\Facades\Excel;

class PermissionController extends BaseApiController
{
    /**
     * PermissionController constructor.
     */
    public function __construct(
        protected readonly PermissionServiceInterface $permissionService
    ) {}

    /**
     * Display a listing of the permissions with filtering, sorting, and pagination.
     */
    public function index(): JsonResponse
    {
        $permissions = $this->permissionService->getFilteredPermissions(request());

        return $this->successResponse(PermissionResource::collection($permissions));
    }

    /**
     * Display all permissions.
     */
    public function all(): JsonResponse
    {
        $permissions = $this->permissionService->getAllPermissions();

        return $this->successResponse(PermissionResource::collection($permissions));
    }

    /**
     * Display the specified permission.
     */
    public function show(int $id): JsonResponse
    {
        $permission = $this->permissionService->getPermissionById($id);

        return $this->successResponse(new PermissionResource($permission));
    }

    /**
     * Store a newly created permission in storage.
     */
    public function store(PermissionStoreRequest $request): JsonResponse
    {
        $permission = $this->permissionService->createPermission($request->validated());

        return $this->createdResponse(new PermissionResource($permission));
    }

    /**
     * Update the specified permission in storage.
     */
    public function update(PermissionUpdateRequest $request, int $id): JsonResponse
    {
        $permission = $this->permissionService->updatePermission($id, $request->validated());

        return $this->successResponse(new PermissionResource($permission));
    }

    /**
     * Remove the specified permission from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $bool = $this->permissionService->deletePermission($id);
        if ($bool) {
            return $this->successResponse(['message' => 'Permission deleted successfully']);
        }

        return $this->errorMessage("Error deleting permission", 500);
    }


    /**
     * Remove the specified Roles from storage.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:permissions,id',
        ]);

        $count = $this->permissionService->deletePermissions($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} permissions successfully"
        ]);
    }

    public function export()
    {
        return Excel::download(new PermissionExport(), 'permissions.xlsx');
    }
}
