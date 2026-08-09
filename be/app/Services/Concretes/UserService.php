<?php

namespace App\Services\Concretes;

use App\Repositories\User\Contracts\UserRepositoryInterface;
use App\Services\Base\Concretes\BaseService;
use App\Services\Contracts\UserServiceInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Request;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Arr;

class UserService extends BaseService implements UserServiceInterface
{
    /**
     * UserService constructor.
     */
    public function __construct(protected UserRepositoryInterface $userRepository)
    {
        $this->setRepository($userRepository);
    }

    /**
     * Get all users
     */
    public function getUsers(): Collection
    {
        return $this->repository->getFiltered();
    }

    /**
     * Get all users
     */
    public function getAllUsers(): Collection
    {
        return $this->repository->all();
    }

    /**
     * Get filtered users with pagination
     */
    public function getFilteredUsers(?Request $request = null, int $perPage = 15): LengthAwarePaginator
    {
        $users = $this->repository->paginateFiltered($perPage);

        $users->getCollection()->load([
            'roles',
            'detail',
            'media',
        ]);

        $users->getCollection()->each(function ($user) {
            $user->avatar = $user->getFirstMediaUrl('avatar', 'thumb');
        });

        return $users;
    }

    /**
     * Get user by ID
     */
    public function getUserById(int $id): ?Model
    {
        try {
            $user = $this->userRepository
                ->query()
                ->with(['roles', 'detail'])
                ->findOrFail($id);

            $user->avatar = $user->getFirstMediaUrl('avatar', 'thumb');

            return $user;
        } catch (ModelNotFoundException $e) {
            throw new ModelNotFoundException('User not found');
        }
    }

    /**
     * Create user
     */
    public function createUser(array $data): Model
    {
        $user =  $this->repository->create($data);
        $user->assignRole($data['role'] ?? 'client');
        $user->detail()->create([
            'phone' => $data['phone'] ?? '',
            'address' => $data['address'] ?? '',
            'city' => $data['city'] ?? '',
            'description' => $data['description'] ?? '',
            'position' => $data['position'] ?? '',
            'website' => $data['website'] ?? '',
            'github' => $data['github'] ?? '',
            'join_date' => $data['join_date'] ?? null,
            'birthday' => $data['birthday'] ?? null,
        ]);
        $user->sendEmailVerificationNotification();
        return $user;
    }

    /**
     * Update user
     */
    public function updateUser(int $id, array $data): Model
    {
        try {
            return DB::transaction(function () use ($id, $data) {

                // Tách data cho user
                $userData = Arr::only($data, [
                    'name',
                    'email',
                    'password',
                    'is_active',
                ]);

                // Tách data cho detail
                $detailData = Arr::only($data, [
                    'phone',
                    'address',
                    'city',
                    'birthday',
                    'join_date',
                    'position',
                    'website',
                    'github',
                    'description',
                ]);

                // Update users table
                $user = $this->repository->update($id, $userData);

                // Update user_details table
                $user->detail()->updateOrCreate(
                    ['user_id' => $user->id],
                    $detailData
                );

                return $user->load(['detail', 'roles', 'media']);
            });
        } catch (ModelNotFoundException $e) {
            throw new ModelNotFoundException('User not found');
        }
    }

    /**
     * Delete user
     */
    public function deleteUser(int $id): bool
    {
        try {
            $this->repository->delete($id);

            return true;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('User not found');
        }
    }

    /**
     * Delete users
     */

    public function deleteUsers(array $ids): int
    {
        try {
            $count = $this->userRepository->bulkDelete($ids);
            if ($count === 0) {
                abort(404, 'Users not found');
            }
            return $count;
        } catch (ModelNotFoundException) {
            throw new ModelNotFoundException('User not found');
        }
    }

    /**
     * Get active users
     */
    public function getActiveUsers(): Collection
    {
        return $this->userRepository->getActiveUsers();
    }
}
