<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\IdentityVerification;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_can_create_booking_for_rent_property(): void
    {
        [$owner, $customer, $property] = $this->seedRentProperty();

        $response = $this->actingAs($customer, 'api')->postJson('/api/v1/bookings', [
            'property_id' => $property->id,
            'start_date' => '2026-08-20',
            'end_date' => '2026-08-23',
            'note' => 'Need early check-in if possible',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.property_id', $property->id)
            ->assertJsonPath('data.customer_id', $customer->id)
            ->assertJsonPath('data.start_date', '2026-08-20')
            ->assertJsonPath('data.end_date', '2026-08-23')
            ->assertJsonPath('data.nights', 3)
            ->assertJsonPath('data.unit_price', '2000000.00')
            ->assertJsonPath('data.total_price', '6000000.00')
            ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseCount('bookings', 1);
    }

    public function test_it_rejects_overlap_booking_and_reports_unavailable(): void
    {
        [$owner, $customer, $property] = $this->seedRentProperty();

        Booking::query()->create([
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-08-20',
            'end_date' => '2026-08-24',
            'nights' => 4,
            'unit_price' => 2000000,
            'total_price' => 8000000,
            'status' => 'confirmed',
        ]);

        $overlapResponse = $this->actingAs($customer, 'api')->postJson('/api/v1/bookings', [
            'property_id' => $property->id,
            'start_date' => '2026-08-22',
            'end_date' => '2026-08-25',
        ]);

        $overlapResponse->assertStatus(422)
            ->assertJsonPath('error', 'Selected date range is not available');

        $availabilityResponse = $this->getJson('/api/v1/properties/' . $property->id . '/availability?start_date=2026-08-22&end_date=2026-08-25');

        $availabilityResponse->assertStatus(200)
            ->assertJsonPath('data.available', false)
            ->assertJsonPath('data.nights', 3);
    }

    public function test_only_property_owner_can_approve_booking(): void
    {
        [$owner, $customer, $property] = $this->seedRentProperty();
        $anotherUser = User::factory()->create();

        $booking = Booking::query()->create([
            'property_id' => $property->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-08-20',
            'end_date' => '2026-08-24',
            'nights' => 4,
            'unit_price' => 2000000,
            'total_price' => 8000000,
            'status' => 'pending',
        ]);

        $forbiddenResponse = $this->actingAs($anotherUser, 'api')
            ->patchJson('/api/v1/bookings/' . $booking->id . '/approve');

        $forbiddenResponse->assertStatus(403);

        $approvedResponse = $this->actingAs($owner, 'api')
            ->patchJson('/api/v1/bookings/' . $booking->id . '/approve');

        $approvedResponse->assertStatus(200)
            ->assertJsonPath('data.status', 'confirmed');
    }

    public function test_owner_bookings_endpoint_returns_only_owner_properties(): void
    {
        [$owner, $customer, $ownerProperty] = $this->seedRentProperty();

        $otherOwner = User::factory()->create();
        $propertyType = PropertyType::query()->firstOrCreate(
            ['slug' => 'house'],
            ['name' => 'House', 'is_active' => true]
        );

        $otherProperty = Property::query()->create([
            'user_id' => $otherOwner->id,
            'property_type_id' => $propertyType->id,
            'listing_type' => 'rent',
            'title' => 'Other Rental House',
            'slug' => 'other-rental-house',
            'price' => 3000000,
            'price_unit' => 'night',
            'status' => 'published',
            'is_active' => true,
            'is_deleted' => false,
        ]);

        Booking::query()->create([
            'property_id' => $ownerProperty->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-08-20',
            'end_date' => '2026-08-22',
            'nights' => 2,
            'unit_price' => 2000000,
            'total_price' => 4000000,
            'status' => 'pending',
        ]);

        Booking::query()->create([
            'property_id' => $otherProperty->id,
            'customer_id' => $customer->id,
            'start_date' => '2026-08-23',
            'end_date' => '2026-08-25',
            'nights' => 2,
            'unit_price' => 3000000,
            'total_price' => 6000000,
            'status' => 'pending',
        ]);

        $response = $this->actingAs($owner, 'api')->getJson('/api/v1/owner/bookings');

        $response->assertStatus(200)
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.property_id', $ownerProperty->id);
    }

    public function test_long_term_monthly_price_and_optional_deposit_are_snapshotted(): void
    {
        [$owner, $customer, $property] = $this->seedRentProperty();
        $property->update(['price_unit'=>'month','long_term_months'=>6,'long_term_price'=>1500000,'deposit_amount'=>5000000]);

        $response=$this->actingAs($customer,'api')->postJson('/api/v1/bookings',[
            'property_id'=>$property->id,'start_date'=>'2026-01-01','end_date'=>'2026-07-01',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.billing_units',6)
            ->assertJsonPath('data.billing_unit','month')
            ->assertJsonPath('data.pricing_tier','long_term')
            ->assertJsonPath('data.unit_price','1500000.00')
            ->assertJsonPath('data.total_price','9000000.00')
            ->assertJsonPath('data.deposit_amount','5000000.00')
            ->assertJsonPath('data.payable_total','14000000.00');
    }

    private function seedRentProperty(): array
    {
        $owner = User::factory()->create();
        $customer = User::factory()->create();
        IdentityVerification::query()->create(['user_id'=>$customer->id,'identity_front_path'=>'test/front.jpg','identity_back_path'=>'test/back.jpg','status'=>'approved']);
        $propertyType = PropertyType::query()->create([
            'name' => 'Apartment',
            'slug' => 'apartment',
            'is_active' => true,
        ]);

        $property = Property::query()->create([
            'user_id' => $owner->id,
            'property_type_id' => $propertyType->id,
            'listing_type' => 'rent',
            'title' => 'Test Rental Apartment',
            'slug' => 'test-rental-apartment',
            'price' => 2000000,
            'price_unit' => 'night',
            'status' => 'published',
            'is_active' => true,
            'is_deleted' => false,
        ]);

        return [$owner, $customer, $property];
    }
}
