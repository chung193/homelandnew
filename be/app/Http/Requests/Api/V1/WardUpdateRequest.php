<?php

namespace App\Http\Requests\Api\V1;

use App\Models\District;
use App\Models\Ward;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WardUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $wardId = $this->route('ward');

        return [
            'province_code' => ['sometimes', 'integer', 'exists:provinces,code'],
            'district_code' => ['sometimes', 'integer', 'exists:districts,code'],
            'code' => ['sometimes', 'integer', Rule::unique('wards', 'code')->ignore($wardId)],
            'name' => ['sometimes', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'full_name_en' => ['nullable', 'string', 'max:255'],
            'division_type' => ['nullable', 'string', 'max:255'],
            'codename' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {
            $wardRoute = $this->route('ward');
            $wardModel = $wardRoute instanceof Ward ? $wardRoute : Ward::query()->find($wardRoute);

            $provinceCode = $this->input('province_code', $wardModel?->province_code);
            $districtCode = $this->input('district_code', $wardModel?->district_code);

            if (! $provinceCode || ! $districtCode) {
                return;
            }

            $isMatch = District::query()
                ->where('code', $districtCode)
                ->where('province_code', $provinceCode)
                ->exists();

            if (! $isMatch) {
                $validator->errors()->add('district_code', 'District does not belong to province_code');
            }
        });
    }
}
