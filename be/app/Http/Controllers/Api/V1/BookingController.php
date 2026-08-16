<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\BookingStoreRequest;
use App\Http\Resources\Api\Booking\BookingResource;
use App\Models\Booking;
use App\Models\BookingStatusHistory;
use App\Models\Property;
use App\Notifications\BookingStatusNotification;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BookingController extends BaseApiController
{
    public function availability(Request $request, Property $property): JsonResponse
    {
        $validated = $request->validate([
            'start_date' => ['nullable', 'date'],
            'end_date' => ['nullable', 'date', 'required_with:start_date', 'after:start_date'],
        ]);

        $startDateRaw = $validated['start_date'] ?? null;
        $endDateRaw = $validated['end_date'] ?? null;

        $activeStatuses = ['pending', 'confirmed', 'in_progress'];

        $blockedQuery = Booking::query()
            ->where('property_id', $property->id)
            ->whereIn('status', $activeStatuses)
            ->orderBy('start_date');

        $blockedRanges = $blockedQuery
            ->get(['id', 'start_date', 'end_date', 'status'])
            ->map(function (Booking $booking) {
                return [
                    'id' => $booking->id,
                    'start_date' => $booking->start_date?->toDateString(),
                    'end_date' => $booking->end_date?->toDateString(),
                    'status' => $booking->status,
                ];
            })
            ->values();

        $isAvailable = null;
        $nights = null;

        if ($startDateRaw && $endDateRaw) {
            $startDate = CarbonImmutable::parse($startDateRaw)->startOfDay();
            $endDate = CarbonImmutable::parse($endDateRaw)->startOfDay();
            $nights = $startDate->diffInDays($endDate);

            if ($nights <= 0) {
                return $this->validationErrorResponse('end_date must be after start_date');
            }

            $isOverlapped = Booking::query()
                ->where('property_id', $property->id)
                ->whereIn('status', $activeStatuses)
                ->whereDate('start_date', '<', $endDate->toDateString())
                ->whereDate('end_date', '>', $startDate->toDateString())
                ->exists();

            $isAvailable = ! $isOverlapped;
        }

        return $this->successResponse([
            'property_id' => $property->id,
            'listing_type' => $property->listing_type,
            'query_start_date' => $startDateRaw,
            'query_end_date' => $endDateRaw,
            'nights' => $nights,
            'available' => $isAvailable,
            'blocked_ranges' => $blockedRanges,
        ]);
    }

    public function store(BookingStoreRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        if (! $user->isIdentityVerified()) {
            return $this->forbiddenResponse('Bạn cần xác minh CCCD trước khi đặt lịch thuê');
        }

        $data = $request->validated();

        $property = Property::query()->find($data['property_id']);
        if (! $property) {
            return $this->notFoundResponse('Property not found');
        }

        if ($property->listing_type !== 'rent') {
            return $this->validationErrorResponse('This property is not available for rent');
        }

        if (! $property->is_active || $property->is_deleted) {
            return $this->validationErrorResponse('This property is not active for booking');
        }

        $startDate = CarbonImmutable::parse($data['start_date'])->startOfDay();
        $endDate = CarbonImmutable::parse($data['end_date'])->startOfDay();
        $nights = $startDate->diffInDays($endDate);

        if ($nights <= 0) {
            return $this->validationErrorResponse('end_date must be after start_date');
        }

        if ($property->price === null) {
            return $this->validationErrorResponse('Property price is missing');
        }

        $rawBillingUnit = mb_strtolower(trim((string) $property->price_unit));
        $billingUnit = match (true) {
            in_array($rawBillingUnit, ['month', 'months', 'monthly', 'tháng', 'thang'], true) => 'month',
            in_array($rawBillingUnit, ['day', 'days', 'daily', 'ngày', 'ngay'], true) => 'day',
            default => 'night',
        };
        $billingUnits = $billingUnit === 'month' ? max(1, (int) ceil($startDate->diffInMonths($endDate))) : $nights;
        $usesLongTermPrice = $billingUnit === 'month'
            && $property->long_term_months
            && $property->long_term_price !== null
            && $billingUnits >= (int) $property->long_term_months;
        $unitPrice = (float) ($usesLongTermPrice ? $property->long_term_price : $property->price);
        $totalPrice = $unitPrice * $billingUnits;
        $depositAmount = (float) ($property->deposit_amount ?? 0);
        $payableTotal = $totalPrice + $depositAmount;

        $booking = DB::transaction(function () use ($property, $user, $startDate, $endDate, $nights, $billingUnits, $billingUnit, $usesLongTermPrice, $unitPrice, $totalPrice, $depositAmount, $payableTotal, $data) {
            $overlapExists = Booking::query()
                ->where('property_id', $property->id)
                ->whereIn('status', ['pending', 'confirmed', 'in_progress'])
                ->whereDate('start_date', '<', $endDate->toDateString())
                ->whereDate('end_date', '>', $startDate->toDateString())
                ->lockForUpdate()
                ->exists();

            if ($overlapExists) {
                return null;
            }

            return Booking::query()->create([
                'property_id' => $property->id,
                'customer_id' => $user->id,
                'start_date' => $startDate->toDateString(),
                'end_date' => $endDate->toDateString(),
                'nights' => $nights,
                'billing_units' => $billingUnits,
                'billing_unit' => $billingUnit,
                'pricing_tier' => $usesLongTermPrice ? 'long_term' : 'standard',
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'deposit_amount' => $depositAmount,
                'payable_total' => $payableTotal,
                'status' => 'pending',
                'note' => $data['note'] ?? null,
            ]);
        });

        if (! $booking) {
            return $this->validationErrorResponse('Selected date range is not available');
        }

        BookingStatusHistory::create(['booking_id'=>$booking->id,'changed_by'=>$user->id,'from_status'=>null,'to_status'=>'pending']);
        $booking->load(['property.user']);
        $this->notify($booking->property?->user, $booking, 'Bạn có một yêu cầu thuê mới đang chờ xác nhận.');

        return $this->createdResponse(new BookingResource($booking));
    }

    public function myBookings(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        $bookings = Booking::query()
            ->with(['property.user.detail', 'customer.detail'])
            ->where('customer_id', $user->id)
            ->orderByDesc('id')
            ->paginate(15);

        return $this->successResponse(BookingResource::collection($bookings));
    }

    public function ownerBookings(Request $request): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        $bookings = Booking::query()
            ->with(['property.user.detail', 'customer.detail'])
            ->whereHas('property', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })
            ->orderByDesc('id')
            ->paginate(15);

        return $this->successResponse(BookingResource::collection($bookings));
    }

    public function cancel(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        if ((int) $booking->customer_id !== (int) $user->id) {
            return $this->forbiddenResponse();
        }

        if (! in_array($booking->status, ['pending', 'confirmed'], true)) {
            return $this->validationErrorResponse('Only pending or confirmed bookings can be cancelled');
        }

        $this->transition($booking, $user->id, 'cancelled', ['cancelled_at'=>now()]);
        $booking->load(['property.user.detail','customer.detail']);
        $this->notify($booking->property?->user, $booking, 'Khách hàng đã hủy yêu cầu thuê.');

        return $this->successResponse(new BookingResource($booking));
    }

    public function approve(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        $booking->loadMissing('property');
        if ((int) $booking->property?->user_id !== (int) $user->id) {
            return $this->forbiddenResponse('Only property owner can approve booking');
        }

        if ($booking->status !== 'pending') {
            return $this->validationErrorResponse('Only pending booking can be approved');
        }

        $this->transition($booking, $user->id, 'confirmed', ['confirmed_at'=>now()]);
        $booking->load(['property.user.detail','customer.detail']);
        $this->notify($booking->customer, $booking, 'Chủ nhà đã xác nhận yêu cầu thuê. Thông tin liên hệ hai bên đã được mở.');

        return $this->successResponse(new BookingResource($booking));
    }

    public function reject(Request $request, Booking $booking): JsonResponse
    {
        $user = $request->user();
        if (! $user) {
            return $this->unauthorizedResponse();
        }

        $booking->loadMissing('property');
        if ((int) $booking->property?->user_id !== (int) $user->id) {
            return $this->forbiddenResponse('Only property owner can reject booking');
        }

        if ($booking->status !== 'pending') {
            return $this->validationErrorResponse('Only pending booking can be rejected');
        }

        $this->transition($booking, $user->id, 'rejected', ['cancelled_at'=>now()]);
        $booking->load(['property.user.detail','customer.detail']);
        $this->notify($booking->customer, $booking, 'Chủ nhà đã từ chối yêu cầu thuê.');

        return $this->successResponse(new BookingResource($booking));
    }

    public function start(Request $request, Booking $booking): JsonResponse
    {
        $booking->loadMissing('property');
        if ((int)$booking->property?->user_id !== (int)$request->user()?->id) return $this->forbiddenResponse('Only property owner can mark handover');
        if ($booking->status !== 'confirmed') return $this->validationErrorResponse('Only confirmed booking can be handed over');
        $this->transition($booking, $request->user()->id, 'in_progress', ['started_at'=>now()]);
        $booking->load(['property.user.detail','customer.detail']);
        $this->notify($booking->customer, $booking, 'Chủ nhà đã xác nhận bàn giao bất động sản.');
        return $this->successResponse(new BookingResource($booking));
    }

    public function complete(Request $request, Booking $booking): JsonResponse
    {
        $booking->loadMissing('property'); $userId=(int)$request->user()?->id;
        if (!in_array($userId,[(int)$booking->customer_id,(int)$booking->property?->user_id],true)) return $this->forbiddenResponse();
        if ($booking->status !== 'in_progress') return $this->validationErrorResponse('Only in-progress booking can be completed');
        $this->transition($booking, $userId, 'completed', ['completed_at'=>now()]);
        $booking->load(['property.user.detail','customer.detail']);
        $recipient=$userId===(int)$booking->customer_id?$booking->property?->user:$booking->customer;
        $this->notify($recipient, $booking, 'Booking đã được xác nhận hoàn thành. Khách hàng có thể đánh giá bất động sản.');
        return $this->successResponse(new BookingResource($booking));
    }

    private function transition(Booking $booking, int $userId, string $status, array $extra=[]): void
    {
        $from=$booking->status; $booking->fill(array_merge(['status'=>$status],$extra))->save();
        BookingStatusHistory::create(['booking_id'=>$booking->id,'changed_by'=>$userId,'from_status'=>$from,'to_status'=>$status]); $booking->refresh();
    }

    private function notify($recipient, Booking $booking, string $message): void
    {
        if (!$recipient) return; try { $recipient->notify(new BookingStatusNotification($booking,$message)); } catch (\Throwable $exception) { report($exception); }
    }
}
