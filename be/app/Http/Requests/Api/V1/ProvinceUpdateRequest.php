<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProvinceUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $provinceId = $this->route('province');

        return [
            'code' => ['sometimes', 'integer', Rule::unique('provinces', 'code')->ignore($provinceId)],
            'name' => ['sometimes', 'string', 'max:255'],
            'name_en' => ['nullable', 'string', 'max:255'],
            'full_name' => ['nullable', 'string', 'max:255'],
            'full_name_en' => ['nullable', 'string', 'max:255'],
            'division_type' => ['nullable', 'string', 'max:255'],
            'codename' => ['nullable', 'string', 'max:255'],
            'phone_code' => ['nullable', 'integer'],
            'order_level' => ['nullable', 'integer'],
            'is_active' => ['nullable', 'boolean'],
        ];
    }
}
