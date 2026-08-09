<?php

namespace App\Http\Resources\Api\User;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin User
 */
class DetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'address' => $this->address,
            'city' => $this->city,
            'phone' => $this->phone,
            'description' => $this->description,
            'position' => $this->position,
            'website' => $this->website,
            'github' => $this->github,
            'join_date' => $this->join_date,
            'birthday' => $this->birthday,
        ];
    }
}
