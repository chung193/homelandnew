<?php

namespace App\Http\Resources\Api\User;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class UserResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $avatar = $this->getFirstMediaUrl('avatar', 'thumb') ?: null;

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $avatar,
            'is_active' => $this->is_active,
            'registration_source' => $this->registration_source,
            'account_type' => $this->account_type,
            'wallet_balance' => (int) $this->wallet_balance,
            'test_posting_credits' => (int) $this->test_posting_credits,
            'detail' => DetailResource::make($this->whenLoaded('detail')),
            'email_verified_at' => $this->email_verified_at,
            'is_verified' => $this->hasVerifiedEmail(),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
