<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class PropertyUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_type_id' => ['nullable', 'integer', 'exists:property_types,id'],
            'listing_type' => ['nullable', 'string', 'in:sale,rent'],
            'title' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'ward' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric'],
            'price_unit' => ['nullable', 'string', 'max:50'],
            'area' => ['nullable', 'numeric'],
            'bedrooms' => ['nullable', 'integer'],
            'bathrooms' => ['nullable', 'integer'],
            'floor' => ['nullable', 'integer'],
            'legal_info' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:draft,published,archived,sold,rented'],
            'is_active' => ['nullable', 'boolean'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['integer', 'exists:amenities,id'],
        ];
    }
}
