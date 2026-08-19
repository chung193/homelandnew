<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\PropertyType;
use App\Models\Property;
use App\Models\Province;
use App\Models\Ward;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_property_search_applies_all_filters_and_rejects_invalid_locations(): void
    {
        $owner = User::factory()->create();
        $type = PropertyType::create(['name'=>'Căn hộ','slug'=>'can-ho','is_active'=>true]);
        $otherType = PropertyType::create(['name'=>'Biệt thự','slug'=>'biet-thu','is_active'=>true]);
        $province = Province::create(['code'=>1,'name'=>'Hà Nội','is_active'=>true]);
        $otherProvince = Province::create(['code'=>2,'name'=>'Đà Nẵng','is_active'=>true]);
        $ward = Ward::create(['code'=>101,'province_code'=>1,'name'=>'Phường Ba Đình','is_active'=>true]);
        Ward::create(['code'=>201,'province_code'=>2,'name'=>'Phường Hải Châu','is_active'=>true]);

        Property::create(['user_id'=>$owner->id,'property_type_id'=>$type->id,'listing_type'=>'rent','title'=>'Căn hộ hồ Tây','slug'=>'can-ho-ho-tay','city'=>$province->name,'ward'=>$ward->name,'status'=>'published','is_active'=>true,'is_deleted'=>false]);
        Property::create(['user_id'=>$owner->id,'property_type_id'=>$otherType->id,'listing_type'=>'sale','title'=>'Biệt thự Đà Nẵng','slug'=>'biet-thu-da-nang','city'=>$otherProvince->name,'ward'=>'Phường Hải Châu','status'=>'published','is_active'=>true,'is_deleted'=>false]);

        $query = http_build_query(['q'=>'hồ Tây','province_code'=>1,'ward_code'=>101,'property_type_id'=>$type->id,'listing_type'=>'rent']);
        $this->getJson('/api/json-api/properties?'.$query)
            ->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.attributes.title', 'Căn hộ hồ Tây');

        $this->getJson('/api/json-api/properties?province_code=999999')
            ->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('meta.total', 0);
        $this->getJson('/api/json-api/properties?province_code=1&ward_code=201')
            ->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('meta.total', 0);
    }

    public function test_property_type_and_amenity_lookups_are_available_without_authentication(): void
    {
        PropertyType::create([
            'name' => 'Villa',
            'slug' => 'villa',
            'is_active' => true,
        ]);

        Amenity::create([
            'name' => 'Swimming Pool',
            'slug' => 'swimming-pool',
            'is_active' => true,
        ]);

        $propertyTypesResponse = $this->getJson('/api/v1/property-types/all');
        $propertyTypesResponse->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Villa');

        $amenitiesResponse = $this->getJson('/api/v1/amenities/all');
        $amenitiesResponse->assertStatus(200)
            ->assertJsonPath('data.0.name', 'Swimming Pool');
    }

    public function test_it_can_create_a_property_with_related_data(): void
    {
        $user = User::create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password123'),
            'is_active' => true,
            'account_type' => 'property_owner',
            'test_posting_credits' => 1,
        ]);
        $user->ownerApplication()->create([
            'status' => 'approved',
            'identity_front_path' => 'private/front.jpg',
            'ownership_document_path' => 'private/ownership.pdf',
        ]);
        $propertyType = PropertyType::create([
            'name' => 'Villa',
            'slug' => 'villa',
            'is_active' => true,
        ]);
        $amenity = Amenity::create([
            'name' => 'Swimming Pool',
            'slug' => 'swimming-pool',
            'is_active' => true,
        ]);

        $response = $this->actingAs($user, 'api')->postJson('/api/v1/properties', [
            'property_type_id' => $propertyType->id,
            'listing_type' => 'sale',
            'title' => 'Luxury Villa',
            'description' => 'Beautiful home',
            'address' => '123 Main Street',
            'address_detail' => 'Apt 12, Building 8',
            'city' => 'Ho Chi Minh',
            'district' => 'District 1',
            'ward' => 'Ward 1',
            'price' => 5000000000,
            'price_unit' => 'total',
            'area' => 250,
            'bedrooms' => 4,
            'bathrooms' => 3,
            'floor' => 2,
            'legal_info' => 'Clear title',
            'status' => 'published',
            'is_active' => true,
            'amenities' => [$amenity->id],
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Luxury Villa')
            ->assertJsonPath('data.property_type_id', $propertyType->id)
            ->assertJsonPath('data.address_detail', 'Apt 12, Building 8')
            ->assertJsonPath('data.amenities.0.id', $amenity->id);
    }
}
