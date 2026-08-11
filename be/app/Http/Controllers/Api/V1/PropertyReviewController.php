<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\Booking;
use App\Models\Property;
use App\Models\PropertyReview;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PropertyReviewController extends BaseApiController
{
    public function index(Property $property): JsonResponse
    {
        $reviews = $property->reviews()
            ->with('user:id,name')
            ->latest()
            ->get()
            ->map(fn (PropertyReview $review) => $this->reviewData($review));

        return $this->successResponse([
            'reviews' => $reviews,
            'average_rating' => round((float) $property->reviews()->avg('rating'), 1),
            'review_count' => $reviews->count(),
        ]);
    }

    public function store(Request $request, Property $property): JsonResponse
    {
        $user = $request->user();
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:2000'],
        ]);

        if ($property->listing_type !== 'rent') {
            return $this->validationErrorResponse('Only rental properties can be reviewed.');
        }

        $hasCompletedStay = Booking::query()
            ->where('property_id', $property->id)
            ->where('customer_id', $user->id)
            ->where('status', 'completed')
            ->exists();

        if (! $hasCompletedStay) {
            return $this->forbiddenResponse('You can review this property after a completed stay.');
        }

        $review = PropertyReview::query()->updateOrCreate(
            ['property_id' => $property->id, 'user_id' => $user->id],
            $validated,
        );
        $review->load('user:id,name');

        return $this->successResponse($this->reviewData($review));
    }

    public function eligibility(Request $request, Property $property): JsonResponse
    {
        $eligible = $property->listing_type === 'rent' && Booking::query()
            ->where('property_id', $property->id)
            ->where('customer_id', $request->user()->id)
            ->where('status', 'completed')
            ->exists();

        return $this->successResponse(['eligible' => $eligible]);
    }

    private function reviewData(PropertyReview $review): array
    {
        return [
            'id' => $review->id,
            'rating' => $review->rating,
            'comment' => $review->comment,
            'created_at' => $review->created_at?->toISOString(),
            'user' => ['id' => $review->user?->id, 'name' => $review->user?->name],
        ];
    }
}
