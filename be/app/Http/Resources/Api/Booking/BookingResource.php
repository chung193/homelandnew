<?php

namespace App\Http\Resources\Api\Booking;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'property_id' => $this->property_id,
            'customer_id' => $this->customer_id,
            'start_date' => $this->start_date?->toDateString(),
            'end_date' => $this->end_date?->toDateString(),
            'nights' => $this->nights,
            'billing_units' => $this->billing_units,
            'billing_unit' => $this->billing_unit,
            'pricing_tier' => $this->pricing_tier,
            'unit_price' => $this->unit_price,
            'total_price' => $this->total_price,
            'deposit_amount' => $this->deposit_amount,
            'payable_total' => $this->payable_total,
            'status' => $this->status,
            'note' => $this->note,
            'confirmed_at' => $this->confirmed_at?->toISOString(),
            'started_at' => $this->started_at?->toISOString(),
            'completed_at' => $this->completed_at?->toISOString(),
            'property' => $this->whenLoaded('property', function () {
                return [
                    'id' => $this->property?->id,
                    'title' => $this->property?->title,
                    'listing_type' => $this->property?->listing_type,
                ];
            }),
            'customer' => $this->when($this->canSeeContact($request), fn () => ['name'=>$this->customer?->name,'email'=>$this->customer?->email,'phone'=>$this->customer?->detail?->phone]),
            'owner' => $this->when($this->canSeeContact($request), fn () => ['name'=>$this->property?->user?->name,'email'=>$this->property?->user?->email,'phone'=>$this->property?->user?->detail?->phone]),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }

    private function canSeeContact(Request $request): bool
    {
        $userId=(int)($request->user()?->id??0); $participant=$userId>0&&in_array($userId,[(int)$this->customer_id,(int)$this->property?->user_id],true);
        return $participant&&in_array($this->status,['confirmed','in_progress','completed'],true);
    }
}
