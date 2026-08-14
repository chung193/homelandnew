<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Requests\Api\V1\ViewingAppointmentStoreRequest;
use App\Http\Resources\Api\ViewingAppointmentResource;
use App\Models\Property;
use App\Models\ViewingAppointment;
use App\Notifications\ViewingAppointmentNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ViewingAppointmentController extends BaseApiController
{
    public function store(ViewingAppointmentStoreRequest $request): JsonResponse
    {
        $user = $request->user();
        if (! $user->isIdentityVerified()) {
            return $this->forbiddenResponse('Bạn cần xác minh CCCD trước khi đặt lịch xem nhà');
        }
        $data = $request->validated();
        $property = Property::query()->with('user')->findOrFail($data['property_id']);

        if (! $property->is_active || $property->is_deleted) {
            return $this->validationErrorResponse('Bất động sản hiện không nhận lịch xem');
        }
        if ((int) $property->user_id === (int) $user->id) {
            return $this->validationErrorResponse('Bạn không thể đặt lịch xem bất động sản của chính mình');
        }

        $conflict = ViewingAppointment::query()
            ->where('property_id', $property->id)
            ->whereDate('appointment_date', $data['appointment_date'])
            ->whereIn('status', ['pending', 'confirmed'])
            ->where('start_time', '<', $data['end_time'])
            ->where('end_time', '>', $data['start_time'])
            ->exists();

        if ($conflict) {
            return $this->validationErrorResponse('Khung giờ này đã có lịch hẹn, vui lòng chọn khung giờ khác');
        }

        $appointment = ViewingAppointment::query()->create([
            ...$data,
            'viewer_id' => $user->id,
            'status' => 'pending',
        ]);
        $appointment->load(['property.user.detail', 'viewer.detail']);
        $this->notify($property->user, $appointment, 'Bạn có một yêu cầu đặt lịch xem nhà mới đang chờ xác nhận.', true);

        return $this->createdResponse(new ViewingAppointmentResource($appointment));
    }

    public function mine(Request $request): JsonResponse
    {
        $items = ViewingAppointment::query()
            ->with(['property.user.detail', 'viewer.detail'])
            ->where('viewer_id', $request->user()->id)
            ->latest('id')->paginate(20);

        return $this->successResponse(ViewingAppointmentResource::collection($items));
    }

    public function owner(Request $request): JsonResponse
    {
        $items = ViewingAppointment::query()
            ->with(['property.user.detail', 'viewer.detail'])
            ->whereHas('property', fn ($query) => $query->where('user_id', $request->user()->id))
            ->latest('id')->paginate(20);

        return $this->successResponse(ViewingAppointmentResource::collection($items));
    }

    public function confirm(Request $request, ViewingAppointment $viewingAppointment): JsonResponse
    {
        return $this->ownerTransition($request, $viewingAppointment, 'confirmed', 'Chủ nhà đã đồng ý khung giờ xem nhà của bạn.');
    }

    public function reject(Request $request, ViewingAppointment $viewingAppointment): JsonResponse
    {
        return $this->ownerTransition($request, $viewingAppointment, 'rejected', 'Chủ nhà không thể tiếp bạn vào khung giờ đã chọn. Vui lòng đặt lịch khác.');
    }

    public function cancel(Request $request, ViewingAppointment $viewingAppointment): JsonResponse
    {
        if ((int) $viewingAppointment->viewer_id !== (int) $request->user()->id) {
            return $this->forbiddenResponse();
        }
        if (! in_array($viewingAppointment->status, ['pending', 'confirmed'], true)) {
            return $this->validationErrorResponse('Lịch hẹn này không thể hủy');
        }

        $viewingAppointment->update(['status' => 'cancelled', 'responded_at' => now()]);
        $viewingAppointment->load(['property.user.detail', 'viewer.detail']);
        $this->notify($viewingAppointment->property?->user, $viewingAppointment, 'Khách đã hủy lịch xem nhà.', true);

        return $this->successResponse(new ViewingAppointmentResource($viewingAppointment));
    }

    private function ownerTransition(Request $request, ViewingAppointment $appointment, string $status, string $message): JsonResponse
    {
        $appointment->loadMissing('property');
        if ((int) $appointment->property?->user_id !== (int) $request->user()->id) {
            return $this->forbiddenResponse('Chỉ chủ bất động sản mới được phản hồi lịch hẹn');
        }
        if ($appointment->status !== 'pending') {
            return $this->validationErrorResponse('Chỉ lịch đang chờ mới được phản hồi');
        }

        $appointment->update(['status' => $status, 'responded_at' => now()]);
        $appointment->load(['property.user.detail', 'viewer.detail']);
        $this->notify($appointment->viewer, $appointment, $message);

        return $this->successResponse(new ViewingAppointmentResource($appointment));
    }

    private function notify($recipient, ViewingAppointment $appointment, string $message, bool $forOwner = false): void
    {
        if (! $recipient || blank($recipient->email)) return;
        try {
            $recipient->notify(new ViewingAppointmentNotification($appointment, $message, $forOwner));
        } catch (\Throwable $exception) {
            report($exception);
        }
    }
}
