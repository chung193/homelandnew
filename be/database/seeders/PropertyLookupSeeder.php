<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\PropertyType;
use Illuminate\Database\Seeder;

class PropertyLookupSeeder extends Seeder
{
    public function run(): void
    {
        $propertyTypes = [
            ['name' => 'Biệt thự', 'slug' => 'biet-thu'],
            ['name' => 'Nhà phố', 'slug' => 'nha-pho'],
            ['name' => 'Căn hộ', 'slug' => 'can-ho'],
            ['name' => 'Đất nền', 'slug' => 'dat-nen'],
            ['name' => 'Văn phòng', 'slug' => 'van-phong'],
        ];

        foreach ($propertyTypes as $propertyType) {
            PropertyType::updateOrCreate(
                ['slug' => $propertyType['slug']],
                ['name' => $propertyType['name'], 'is_active' => true]
            );
        }

        $amenities = [
            ['name' => 'Hồ bơi', 'slug' => 'ho-boi'],
            ['name' => 'Sân parking', 'slug' => 'san-parking'],
            ['name' => 'Máy lạnh', 'slug' => 'may-lanh'],
            ['name' => 'Camera', 'slug' => 'camera'],
            ['name' => 'Ban công', 'slug' => 'ban-cong'],
        ];

        foreach ($amenities as $amenity) {
            Amenity::updateOrCreate(
                ['slug' => $amenity['slug']],
                ['name' => $amenity['name'], 'is_active' => true]
            );
        }
    }
}
