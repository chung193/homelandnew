<?php

namespace App\Http\Requests\Api\V1;

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
            'district_code' => ['sometimes', 'nullable', 'integer', 'exists:districts,code'],
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

}
