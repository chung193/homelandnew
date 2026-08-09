<?php

namespace App\Http\Resources\Api\User;

use App\Http\Resources\Api\Role\RoleResource;
use App\Http\Resources\Api\User\DetailResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserWithDetailRoleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            'avatar' => $this->avatar,
            'roles' => RoleResource::collection($this->roles ?? []),
            'detail' => DetailResource::make($this->detail)
        ];
    }
}
