<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\District;
use App\Models\Property;
use App\Models\PropertyType;
use App\Models\Province;
use App\Models\User;
use App\Models\Ward;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PropertySeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::role('admin')->first();

        if (! $admin) {
            $this->command?->warn('PropertySeeder skipped: no admin account found.');
            return;
        }

        $propertyTypes = PropertyType::query()->get(['id', 'name']);

        if ($propertyTypes->isEmpty()) {
            $this->command?->warn('PropertySeeder skipped: no property types found.');
            return;
        }

        $amenityIds = Amenity::query()->pluck('id')->values()->all();
        $provinceNames = Province::query()->pluck('name')->values();
        $districtsByProvince = District::query()
            ->select(['province_code', 'name', 'code'])
            ->get()
            ->groupBy('province_code');
        $wardsByDistrict = Ward::query()
            ->select(['district_code', 'name'])
            ->get()
            ->groupBy('district_code');

        DB::table('property_amenity')->delete();
        Property::query()->forceDelete();

        $listingTypes = ['sale', 'rent'];

        for ($index = 1; $index <= 100; $index++) {
            $propertyType = $propertyTypes->random();
            $listingType = $listingTypes[array_rand($listingTypes)];

            $provinceName = 'Ha Noi';
            $districtName = 'Ba Dinh';
            $wardName = 'Phuc Xa';

            if ($provinceNames->isNotEmpty()) {
                $provinceName = (string) $provinceNames->random();

                $province = Province::query()->where('name', $provinceName)->first();
                $districts = $province ? ($districtsByProvince->get($province->code) ?? collect()) : collect();

                if ($districts->isNotEmpty()) {
                    $district = $districts->random();
                    $districtName = (string) $district->name;

                    $wards = $wardsByDistrict->get($district->code) ?? collect();
                    if ($wards->isNotEmpty()) {
                        $wardName = (string) $wards->random()->name;
                    }
                }
            }

            $title = sprintf('%s %s %s #%d', $listingType === 'sale' ? 'Ban' : 'Cho thue', $propertyType->name, $districtName, $index);

            $price = $listingType === 'sale'
                ? fake()->numberBetween(1500000000, 9500000000)
                : fake()->numberBetween(5000000, 60000000);

            $statusPool = $listingType === 'sale'
                ? ['published', 'published', 'published', 'published', 'draft', 'archived', 'sold']
                : ['published', 'published', 'published', 'published', 'draft', 'archived', 'rented'];

            $property = Property::query()->create([
                'user_id' => $admin->id,
                'property_type_id' => $propertyType->id,
                'listing_type' => $listingType,
                'title' => $title,
                'slug' => Str::slug($title) . '-' . $index . '-' . Str::lower(Str::random(4)),
                'description' => fake()->paragraphs(2, true),
                'address' => fake()->streetAddress(),
                'address_detail' => fake()->optional()->secondaryAddress(),
                'city' => $provinceName,
                'district' => $districtName,
                'ward' => $wardName,
                'latitude' => fake()->optional(0.9)->latitude(8.5, 23.5),
                'longitude' => fake()->optional(0.9)->longitude(102.0, 109.5),
                'price' => $price,
                'price_unit' => $listingType === 'sale' ? 'total' : 'month',
                'area' => fake()->randomFloat(2, 35, 450),
                'bedrooms' => fake()->numberBetween(1, 6),
                'bathrooms' => fake()->numberBetween(1, 5),
                'floor' => fake()->numberBetween(1, 30),
                'legal_info' => fake()->optional(0.8)->sentence(),
                'status' => $statusPool[array_rand($statusPool)],
                'is_active' => true,
                'is_deleted' => false,
            ]);

            if (count($amenityIds) > 0) {
                $take = min(count($amenityIds), fake()->numberBetween(2, 5));
                $picked = collect($amenityIds)->shuffle()->take($take)->values()->all();
                $property->amenities()->sync($picked);
            }
        }

        $this->command?->info('Created 100 demo properties for the admin account.');
    }
}
