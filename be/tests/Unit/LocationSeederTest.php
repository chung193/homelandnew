<?php

namespace Tests\Unit;

use Database\Seeders\LocationSeeder;
use PHPUnit\Framework\TestCase;

class LocationSeederTest extends TestCase
{
    public function test_source_url_uses_current_two_tier_api(): void
    {
        $seeder = new class extends LocationSeeder {
            public function getSourceUrl(): string
            {
                return $this->sourceUrl();
            }
        };

        $this->assertSame(
            'https://provinces.open-api.vn/api/v2/?depth=2',
            $seeder->getSourceUrl(),
        );
    }
}
