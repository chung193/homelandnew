<?php

namespace Tests\Feature;

use App\Models\Amenity;
use App\Models\PropertyType;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PropertyApiTest extends TestCase
{
    use RefreshDatabase;

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
