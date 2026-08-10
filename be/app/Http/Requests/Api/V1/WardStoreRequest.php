<?php

namespace App\Http\Requests\Api\V1;

use App\Models\District;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class WardStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'province_code' => ['required', 'integer', 'exists:provinces,code'],
            'district_code' => ['required', 'integer', 'exists:districts,code'],
            'code' => ['required', 'integer', Rule::unique('wards', 'code')],
            'name' => ['required', 'string', 'max:255'],
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
            $provinceCode = $this->input('province_code');
            $districtCode = $this->input('district_code');

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
