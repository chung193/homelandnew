<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\District;
use App\Models\Province;
use Illuminate\Http\Request;

class LocationController extends BaseApiController
{
    public function provinces()
    {
        return $this->successResponse(
            Province::query()->active()->orderBy('order_level')->orderBy('name')->get()
        );
    }

    /** @deprecated Districts were removed from Vietnam's administrative structure in July 2025. */
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

        return $province
            ? $this->successResponse($province->districts()->orderBy('name')->get())
            : $this->notFoundResponse('Province not found');
    }

    public function wards(Request $request)
    {
        $provinceCode = $request->input('province_code', $request->input('province_id'));
        $districtCode = $request->input('district_code', $request->input('district_id'));

        $request->validate([
            'province_code' => 'nullable|integer',
            'province_id' => 'nullable|integer',
            'district_code' => 'nullable|integer',
            'district_id' => 'nullable|integer',
        ]);

        if ($provinceCode) {
            $province = Province::where('code', $provinceCode)->orWhere('id', $provinceCode)->first();

            return $province
                ? $this->successResponse($province->wards()->active()->orderBy('name')->get())
                : $this->notFoundResponse('Province not found');
        }

        // Backward compatibility for clients still sending legacy district codes.
        if ($districtCode) {
            $district = District::where('code', $districtCode)->orWhere('id', $districtCode)->first();

            return $district
                ? $this->successResponse($district->wards()->active()->orderBy('name')->get())
                : $this->notFoundResponse('District not found');
        }

        return $this->errorResponse('province_code is required', 422);
    }
}
