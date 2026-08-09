<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\UserStoreRequest;
use App\Http\Requests\Api\V1\UserUpdateRequest;
use App\Http\Requests\Api\V1\UserDetailUpdateRequest;
use App\Http\Resources\Api\User\UserResource;
use App\Http\Resources\Api\User\UserWithRoleResource;
use App\Http\Resources\Api\User\UserWithDetailRoleResource;
use App\Http\Requests\Api\V1\AssignUserRolesRequest;
use App\Services\Contracts\UserServiceInterface;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Exports\UserExport;
use Maatwebsite\Excel\Facades\Excel;

class UserController extends BaseApiController
{
    /**
     * UserController constructor.
     */
    public function __construct(
        protected readonly UserServiceInterface $userService
    ) {}

    /**
     * Display a listing of the users with filtering, sorting, and pagination.
     */
    public function index(): JsonResponse
    {
        $users = $this->userService->getFilteredUsers(request());
        return $this->successResponse(UserWithDetailRoleResource::collection($users));
    }

    /**
     * Display all users.
     */
    public function all(): JsonResponse
    {
        $users = $this->userService->getAllUsers();

        return $this->successResponse(UserResource::collection($users));
    }

    /**
     * Display the specified user.
     */
    public function show(int $id): JsonResponse
    {
        $user = $this->userService->getUserById($id);
        return $this->successResponse(new UserWithDetailRoleResource($user));
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(UserStoreRequest $request): JsonResponse
    {
        $user = $this->userService->createUser($request->validated());
        return $this->createdResponse(new UserResource($user));
    }

    /**
     * Update the specified user in storage.
     */
    public function update(UserDetailUpdateRequest $request, int $id): JsonResponse
    {
        $user = $this->userService->updateUser($id, $request->validated());
        return $this->successResponse(new UserResource($user));
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(int $id): JsonResponse
    {
        $bool = $this->userService->deleteUser($id);
        if ($bool) {
            return $this->successResponse(['message' => 'User deleted successfully']);
        }
        return $this->errorMessage("Error deleting user", 500);
    }

    /**
     * Remove the specified Users from storage.
     */
    public function bulkDestroy(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:users,id',
        ]);

        $count = $this->userService->deleteUsers($validated['ids']);

        return $this->successResponse([
            'message' => "Deleted {$count} users successfully"
        ]);
    }

    /**
     * Display a listing of active users.
     */
    public function active(): JsonResponse
    {
        $users = $this->userService->getActiveUsers();

        return $this->successResponse(UserResource::collection($users));
    }

    public function export()
    {
        return Excel::download(new UserExport(), 'users.xlsx');
    }

    public function assignRoles(int $id, AssignUserRolesRequest $request)
    {
        $user = User::findOrFail($id);
        $user->roles()->sync($request->input('role_ids', []));

        return response()->json([
            'success' => true,
            'data' => $user->load('roles'),
        ]);
    }
}
