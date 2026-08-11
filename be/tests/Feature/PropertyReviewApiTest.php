<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyReviewApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_can_review_after_completed_stay(): void
    {
        [$customer, $property] = $this->rentProperty();
        $this->booking($customer, $property, 'completed');

        $this->actingAs($customer, 'api')
            ->postJson("/api/v1/properties/{$property->id}/reviews", ['rating' => 5, 'comment' => 'Great stay'])
            ->assertOk()
            ->assertJsonPath('data.rating', 5);

        $this->getJson("/api/v1/properties/{$property->id}/reviews")
            ->assertOk()
            ->assertJsonPath('data.review_count', 1)
            ->assertJsonPath('data.average_rating', 5);
    }

    public function test_customer_cannot_review_before_stay_is_completed(): void
    {
        [$customer, $property] = $this->rentProperty();
        $this->booking($customer, $property, 'confirmed', now()->addDays(2)->toDateString());

        $this->actingAs($customer, 'api')
            ->postJson("/api/v1/properties/{$property->id}/reviews", ['rating' => 4])
            ->assertForbidden();
    }

    private function rentProperty(): array
    {
        $owner = User::factory()->create();
        $customer = User::factory()->create();
        $type = PropertyType::query()->create(['name' => 'Apartment', 'slug' => 'apartment', 'is_active' => true]);
        $property = Property::query()->create([
            'user_id' => $owner->id, 'property_type_id' => $type->id, 'listing_type' => 'rent',
            'title' => 'Reviewable rental', 'slug' => 'reviewable-rental', 'price' => 1000000,
            'price_unit' => 'night', 'status' => 'published', 'is_active' => true, 'is_deleted' => false,
        ]);
        return [$customer, $property];
    }

    private function booking(User $customer, Property $property, string $status, ?string $endDate = null): void
    {
        Booking::query()->create([
            'property_id' => $property->id, 'customer_id' => $customer->id,
            'start_date' => now()->subDays(3)->toDateString(), 'end_date' => $endDate ?? now()->subDay()->toDateString(),
            'nights' => 2, 'unit_price' => 1000000, 'total_price' => 2000000, 'status' => $status,
        ]);
    }
}
