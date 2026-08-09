<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\District;
use App\Models\Province;
use App\Models\Ward;
use Illuminate\Http\Request;

class LocationController extends BaseApiController
{
    public function provinces()
    {
        $provinces = Province::query()
            ->active()
            ->orderBy('order_level')
            ->orderBy('name')
            ->get();

        return $this->successResponse($provinces);
    }

    public function districts(Request $request)
    {
        $provinceCode = $request->input('province_code', $request->input('province_id'));

        $request->validate([
            'province_code' => 'nullable|integer',
            'province_id' => 'nullable|integer',
        ]);

        if (! $provinceCode) {
            return $this->errorResponse('province_code is required', 422);
        }

        $province = Province::where('code', $provinceCode)->orWhere('id', $provinceCode)->first();

        if (! $province) {
            return $this->notFoundResponse('Province not found');
        }

        $districts = $province->districts()
            ->orderBy('name')
            ->get();

        return $this->successResponse($districts);
    }

    public function wards(Request $request)
    {
        $districtCode = $request->input('district_code', $request->input('district_id'));

        $request->validate([
            'district_code' => 'nullable|integer',
            'district_id' => 'nullable|integer',
        ]);

        if (! $districtCode) {
            return $this->errorResponse('district_code is required', 422);
        }

        $district = District::where('code', $districtCode)->orWhere('id', $districtCode)->first();

        if (! $district) {
            return $this->notFoundResponse('District not found');
        }

        $wards = $district->wards()
            ->orderBy('name')
            ->get();

        return $this->successResponse($wards);
    }
}
