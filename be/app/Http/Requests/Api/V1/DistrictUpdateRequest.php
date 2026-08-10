<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DistrictUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $districtId = $this->route('district');

        return [
            'province_code' => ['sometimes', 'integer', 'exists:provinces,code'],
            'code' => ['sometimes', 'integer', Rule::unique('districts', 'code')->ignore($districtId)],
            'name' => ['sometimes', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'full_name_en' => ['nullable', 'string', 'max:255'],
            'division_type' => ['nullable', 'string', 'max:255'],
            'codename' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
