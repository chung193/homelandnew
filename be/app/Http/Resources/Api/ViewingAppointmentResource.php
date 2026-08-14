<?php

namespace App\Http\Resources\Api;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ViewingAppointmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'property_id' => $this->property_id,
            'viewer_id' => $this->viewer_id,
            'appointment_date' => $this->appointment_date?->toDateString(),
            'start_time' => substr((string) $this->start_time, 0, 5),
            'end_time' => substr((string) $this->end_time, 0, 5),
            'note' => $this->note,
            'status' => $this->status,
            'responded_at' => $this->responded_at?->toISOString(),
            'property' => $this->whenLoaded('property', fn () => [
                'id' => $this->property?->id,
                'title' => $this->property?->title,
                'address' => $this->property?->address,
            ]),
            'viewer' => $this->whenLoaded('viewer', fn () => [
                'name' => $this->viewer?->name,
                'email' => $this->viewer?->email,
                'phone' => $this->viewer?->detail?->phone,
            ]),
            'owner' => $this->whenLoaded('property', fn () => [
                'name' => $this->property?->user?->name,
                'email' => $this->property?->user?->email,
                'phone' => $this->property?->user?->detail?->phone,
            ]),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
