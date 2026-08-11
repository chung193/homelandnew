<?php

namespace Tests\Feature;

use App\Models\OwnerApplication;
use App\Models\PropertyType;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyPostingAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_without_approved_owner_profile_cannot_post(): void
    {
        $customer = User::factory()->create(['account_type'=>'customer','wallet_balance'=>500000]);
        $type = PropertyType::create(['name'=>'House','slug'=>'house','is_active'=>true]);
        $this->actingAs($customer, 'api')->postJson('/api/v1/properties', $this->payload($type->id))->assertForbidden();
    }

    public function test_approved_owner_is_charged_configured_fee_and_post_is_pending(): void
    {
        config(['momo.posting_fee'=>100000]);
        $owner = User::factory()->create(['account_type'=>'property_owner','wallet_balance'=>150000]);
        $role = Role::create(['name'=>'property_owner','guard_name'=>'api']);
        $owner->assignRole($role);
        OwnerApplication::create(['user_id'=>$owner->id,'status'=>'approved','identity_front_path'=>'private/front.jpg','ownership_document_path'=>'private/ownership.pdf']);
        $type = PropertyType::create(['name'=>'Apartment','slug'=>'apartment','is_active'=>true]);

        $this->actingAs($owner, 'api')->postJson('/api/v1/properties', $this->payload($type->id))
            ->assertCreated()->assertJsonPath('data.status', 'pending')->assertJsonPath('data.is_active', false);

        $this->assertSame(50000, (int)$owner->fresh()->wallet_balance);
        $this->assertDatabaseHas('wallet_transactions', ['user_id'=>$owner->id,'type'=>'posting_fee','amount'=>-100000,'status'=>'paid']);
    }

    public function test_approved_owner_can_use_test_credit_without_wallet_charge(): void
    {
        config(['momo.posting_fee'=>100000]);
        $owner = User::factory()->create(['account_type'=>'property_owner','wallet_balance'=>0,'test_posting_credits'=>2]);
        $role = Role::create(['name'=>'property_owner','guard_name'=>'api']);
        $owner->assignRole($role);
        OwnerApplication::create(['user_id'=>$owner->id,'status'=>'approved','identity_front_path'=>'private/front.jpg','ownership_document_path'=>'private/ownership.pdf']);
        $type = PropertyType::create(['name'=>'Villa','slug'=>'villa','is_active'=>true]);

        $this->actingAs($owner, 'api')->postJson('/api/v1/properties', $this->payload($type->id))
            ->assertCreated()->assertJsonPath('data.posting_fee', 0);

        $owner->refresh();
        $this->assertSame(1, (int)$owner->test_posting_credits);
        $this->assertSame(0, (int)$owner->wallet_balance);
        $this->assertDatabaseCount('wallet_transactions', 0);
    }

    private function payload(int $typeId): array
    {
        return ['property_type_id'=>$typeId,'listing_type'=>'sale','title'=>'Test property','price'=>2000000000];
    }
}
