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
            'identity_verified' => $this->isIdentityVerified(),
            'is_property_owner' => $this->ownerApplications()->where('status', 'approved')->exists(),
            'owner_types' => $this->ownerApplications()->where('status', 'approved')->pluck('owner_type')->values(),
            'owner_applications' => $this->ownerApplications()->get(['id', 'owner_type', 'status', 'rejection_reason']),
            'owner_type' => $this->ownerApplication?->owner_type,
            'owner_application_status' => $this->ownerApplication?->status,
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
