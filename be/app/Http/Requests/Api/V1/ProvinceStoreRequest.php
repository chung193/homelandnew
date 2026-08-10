<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProvinceStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'code' => ['required', 'integer', Rule::unique('provinces', 'code')],
            'name' => ['required', 'string', 'max:255'],
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
