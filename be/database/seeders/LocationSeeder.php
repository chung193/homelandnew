<?php

namespace Database\Seeders;

use App\Models\Province;
use App\Models\Ward;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $data = $this->readJsonFile(database_path('seeders/data/vietnam-administrative-units-2025.json'))
            ?? $this->fetchJson($this->sourceUrl());

        if (! is_array($data)) {
            $this->command?->warn('Unable to load administrative units from the local snapshot or remote API.');
            return;
        }

        DB::transaction(function () use ($data): void {
            Ward::query()->delete();
            DB::table('districts')->delete();
            Province::query()->delete();

            foreach ($data as $provinceData) {
                $province = Province::query()->create([
                    'code' => $provinceData['code'],
                    'name' => $provinceData['name'],
                    'name_en' => $provinceData['name_en'] ?? null,
                    'full_name' => $provinceData['full_name'] ?? null,
                    'full_name_en' => $provinceData['full_name_en'] ?? null,
                    'division_type' => $provinceData['division_type'] ?? null,
                    'codename' => $provinceData['codename'] ?? null,
                    'phone_code' => $provinceData['phone_code'] ?? null,
                    'order_level' => $provinceData['order_level'] ?? 0,
                    'is_active' => true,
                ]);

                foreach ($provinceData['wards'] ?? [] as $wardData) {
                    Ward::query()->create([
                        'province_code' => $province->code,
                        'district_code' => null,
                        'code' => $wardData['code'],
                        'name' => $wardData['name'],
                        'name_en' => $wardData['name_en'] ?? null,
                        'full_name' => $wardData['full_name'] ?? null,
                        'full_name_en' => $wardData['full_name_en'] ?? null,
                        'division_type' => $wardData['division_type'] ?? null,
                        'codename' => $wardData['codename'] ?? null,
                        'is_active' => true,
                    ]);
                }
            }
        });

        $this->command?->info(sprintf('Seeded %d provinces and %d wards using the current two-tier structure.', Province::count(), Ward::count()));
    }

    private function readJsonFile(string $path): mixed
    {
        return is_file($path) && is_readable($path)
            ? json_decode(file_get_contents($path), true)
            : null;
    }

    protected function sourceUrl(): string
    {
        return 'https://provinces.open-api.vn/api/v2/?depth=2';
    }

    private function fetchJson(string $url): mixed
    {
        $context = stream_context_create(['http' => [
            'method' => 'GET',
            'header' => "Accept: application/json\r\n",
            'timeout' => 30,
        ]]);

        $content = @file_get_contents($url, false, $context);

        return $content === false ? null : json_decode($content, true);
    }
}
