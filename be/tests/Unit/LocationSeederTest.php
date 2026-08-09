<?php

namespace Tests\Unit;

use Database\Seeders\LocationSeeder;
use PHPUnit\Framework\TestCase;

class LocationSeederTest extends TestCase
{
    public function test_detail_url_uses_depth_three_to_include_wards(): void
    {
        $seeder = new class extends LocationSeeder {
            public function getDetailUrl(int $provinceCode): string
            {
                return $this->buildDetailUrl($provinceCode);
            }
        };

        $this->assertSame(
            'https://provinces.open-api.vn/api/v1/p/1?depth=3',
            $seeder->getDetailUrl(1)
        );
    }
}
