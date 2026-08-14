<?php

namespace Tests\Feature;

use App\Models\Property;
use App\Models\IdentityVerification;
use App\Models\PropertyType;
use App\Models\User;
use App\Models\ViewingAppointment;
use App\Notifications\ViewingAppointmentNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class ViewingAppointmentApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_viewer_can_request_a_viewing_and_owner_is_emailed(): void
    {
        Notification::fake();
        [$owner, $viewer, $property] = $this->property();

        $response = $this->actingAs($viewer, 'api')->postJson('/api/v1/viewing-appointments', [
            'property_id' => $property->id,
            'appointment_date' => now()->addDays(2)->toDateString(),
            'start_time' => '09:00',
            'end_time' => '10:00',
            'note' => 'Tôi muốn xem phòng ngủ và chỗ đỗ xe.',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', 'pending')
            ->assertJsonPath('data.start_time', '09:00');
        Notification::assertSentTo($owner, ViewingAppointmentNotification::class);
    }

    public function test_owner_can_confirm_and_viewer_is_emailed(): void
    {
        Notification::fake();
        [$owner, $viewer, $property] = $this->property();
        $appointment = ViewingAppointment::query()->create([
            'property_id' => $property->id, 'viewer_id' => $viewer->id,
            'appointment_date' => now()->addDays(2), 'start_time' => '09:00',
            'end_time' => '10:00', 'status' => 'pending',
        ]);

        $this->actingAs($owner, 'api')
            ->patchJson("/api/v1/viewing-appointments/{$appointment->id}/confirm")
            ->assertOk()->assertJsonPath('data.status', 'confirmed');

        Notification::assertSentTo($viewer, ViewingAppointmentNotification::class);
    }

    public function test_another_user_cannot_respond_and_overlapping_slot_is_rejected(): void
    {
        [$owner, $viewer, $property] = $this->property();
        $appointment = ViewingAppointment::query()->create([
            'property_id' => $property->id, 'viewer_id' => $viewer->id,
            'appointment_date' => now()->addDays(2), 'start_time' => '09:00',
            'end_time' => '10:00', 'status' => 'pending',
        ]);

        $this->actingAs(User::factory()->create(), 'api')
            ->patchJson("/api/v1/viewing-appointments/{$appointment->id}/reject")
            ->assertForbidden();

        $secondViewer = User::factory()->create();
        IdentityVerification::query()->create(['user_id'=>$secondViewer->id,'identity_front_path'=>'test/front2.jpg','identity_back_path'=>'test/back2.jpg','status'=>'approved']);
        $this->actingAs($secondViewer, 'api')->postJson('/api/v1/viewing-appointments', [
            'property_id' => $property->id,
            'appointment_date' => now()->addDays(2)->toDateString(),
            'start_time' => '09:30', 'end_time' => '10:30',
        ])->assertUnprocessable();
    }

    private function property(): array
    {
        $owner = User::factory()->create(['email' => 'owner@example.com']);
        $viewer = User::factory()->create(['email' => 'viewer@example.com']);
        IdentityVerification::query()->create(['user_id'=>$viewer->id,'identity_front_path'=>'test/front.jpg','identity_back_path'=>'test/back.jpg','status'=>'approved']);
        $type = PropertyType::query()->create(['name' => 'Nhà', 'slug' => 'nha', 'is_active' => true]);
        $property = Property::query()->create([
            'user_id' => $owner->id, 'property_type_id' => $type->id,
            'listing_type' => 'sale', 'title' => 'Nhà cần bán', 'slug' => 'nha-can-ban',
            'status' => 'published', 'is_active' => true, 'is_deleted' => false,
        ]);

        return [$owner, $viewer, $property];
    }
}
