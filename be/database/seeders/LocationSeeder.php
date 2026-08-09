<?php

namespace Database\Seeders;

use App\Models\District;
use App\Models\Province;
use App\Models\Ward;
use Illuminate\Database\Seeder;

class LocationSeeder extends Seeder
{
    public function run(): void
    {
        $provincesData = $this->fetchJson('https://provinces.open-api.vn/api/p/');

        if (! is_array($provincesData)) {
            $this->command->warn('Unable to fetch provinces from the remote API.');

            return;
        }

        foreach ($provincesData as $provinceData) {
            $province = Province::updateOrCreate(
                ['code' => $provinceData['code']],
                [
                    'name' => $provinceData['name'] ?? null,
                    'name_en' => $provinceData['name_en'] ?? null,
                    'full_name' => $provinceData['full_name'] ?? null,
                    'full_name_en' => $provinceData['full_name_en'] ?? null,
                    'division_type' => $provinceData['division_type'] ?? null,
                    'codename' => $provinceData['codename'] ?? null,
                    'phone_code' => $provinceData['phone_code'] ?? null,
                    'order_level' => $provinceData['order_level'] ?? 0,
                    'is_active' => true,
                ]
            );

            $detail = $this->fetchJson('https://provinces.open-api.vn/api/p/' . $provinceData['code'] . '?depth=2');

            if (! is_array($detail)) {
                continue;
            }

            foreach ($detail['districts'] ?? [] as $districtData) {
                $district = District::updateOrCreate(
                    [
                        'province_code' => $province->code,
                        'code' => $districtData['code'],
                    ],
                    [
                        'name' => $districtData['name'] ?? null,
                        'name_en' => $districtData['name_en'] ?? null,
                        'full_name' => $districtData['full_name'] ?? null,
                        'full_name_en' => $districtData['full_name_en'] ?? null,
                        'division_type' => $districtData['division_type'] ?? null,
                        'codename' => $districtData['codename'] ?? null,
                        'is_active' => true,
                    ]
                );

                foreach ($districtData['wards'] ?? [] as $wardData) {
                    Ward::updateOrCreate(
                        [
                            'province_code' => $province->code,
                            'district_code' => $district->code,
                            'code' => $wardData['code'],
                        ],
                        [
                            'name' => $wardData['name'] ?? null,
                            'name_en' => $wardData['name_en'] ?? null,
                            'full_name' => $wardData['full_name'] ?? null,
                            'full_name_en' => $wardData['full_name_en'] ?? null,
                            'division_type' => $wardData['division_type'] ?? null,
                            'codename' => $wardData['codename'] ?? null,
                            'is_active' => true,
                        ]
                    );
                }
            }
        }
    }

    private function fetchJson(string $url): mixed
    {
        $context = stream_context_create([
            'http' => [
                'method' => 'GET',
                'header' => "Accept: application/json\r\n",
                'timeout' => 30,
            ],
        ]);

        $content = @file_get_contents($url, false, $context);

        if ($content === false) {
            return null;
        }

        return json_decode($content, true);
    }
}
