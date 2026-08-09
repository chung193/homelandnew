<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\RoleStoreRequest;
use App\Http\Requests\Api\V1\RoleUpdateRequest;
use App\Http\Resources\Api\Role\RoleResource;
use App\Http\Resources\Api\Role\RoleWithPermissionResource;
use App\Services\Contracts\RoleServiceInterface;
use Illuminate\Http\JsonResponse;
use App\Models\Permission;
use App\Models\Role;
use App\Http\Requests\Api\V1\AssignPermissionsRequest;
use Illuminate\Http\Request;
use App\Exports\RoleExport;
use Maatwebsite\Excel\Facades\Excel;

class RoleController extends BaseApiController
{
    /**
     * RoleController constructor.
     */
    public function __construct(
        protected readonly RoleServiceInterface $roleService
    ) {}

    /**
     * Display a listing of the Roles with filtering, sorting, and pagination.
     */
    public function index(): JsonResponse
    {
        $roles = $this->roleService->getFilteredRoles(request());
        return $this->successResponse(RoleWithPermissionResource::collection($roles));
    }

    /**
     * Display all Roles.
     */
    public function all(): JsonResponse
    {
        $roles = $this->roleService->getAllRoles();

        return $this->successResponse(RoleResource::collection($roles));
    }

    /**
     * Display the specified Role.
     */
    public function show(int $id): JsonResponse
    {
        $role = $this->roleService->getRoleById($id);

        return $this->successResponse(new RoleResource($role));
    }

    /**
     * Store a newly created Role in storage.
     */
    public function store(RoleStoreRequest $request): JsonResponse
    {
        $role = $this->roleService->createRole($request->validated());

        return $this->createdResponse(new RoleResource($role));
    }

    /**
     * Update the specified Role in storage.
     */
    public function update(RoleUpdateRequest $request, int $id): JsonResponse
    {
        $role = $this->roleService->updateRole($id, $request->validated());

        return $this->successResponse(new RoleResource($role));
    }

    /**
     * Remove the specified Role from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $bool = $this->roleService->deleteRole($id);

        if ($bool) {
            return $this->successResponse(['message' => 'Role deleted successfully']);
        }

        return $this->errorMessage("Error deleting role", 500);
    }

    /**
     * Remove the specified Roles from storage.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:roles,id',
        ]);

        $count = $this->roleService->deleteRoles($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} roles successfully"
        ]);
    }

    public function assignPermissions(
        Role $role,
        AssignPermissionsRequest $request
    ) {
        $permissionIds = $request->input('permission_ids', []);


        $this->roleService->assignPermissions(
            $role->id,
            $permissionIds
        );

        return $this->successResponse([
            'message' => 'Permissions assigned successfully',
        ]);
    }

    public function export()
    {
        return Excel::download(new RoleExport(), 'roles.xlsx');
    }
}
