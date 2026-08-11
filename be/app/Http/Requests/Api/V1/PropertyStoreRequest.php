<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class PropertyStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'property_type_id' => ['required', 'integer', 'exists:property_types,id'],
            'listing_type' => ['required', 'string', 'in:sale,rent'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
            'address_detail' => ['nullable', 'string', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'ward' => ['nullable', 'string', 'max:255'],
            'price' => ['nullable', 'numeric'],
            'price_unit' => ['nullable', 'string', 'max:50'],
            'long_term_months' => ['nullable', 'integer', 'min:2', 'max:120', 'required_with:long_term_price'],
            'long_term_price' => ['nullable', 'numeric', 'min:0', 'required_with:long_term_months'],
            'deposit_amount' => ['nullable', 'numeric', 'min:0'],
            'area' => ['nullable', 'numeric'],
            'bedrooms' => ['nullable', 'integer'],
            'bathrooms' => ['nullable', 'integer'],
            'floor' => ['nullable', 'integer'],
            'legal_info' => ['nullable', 'string'],
            'status' => ['nullable', 'string', 'in:draft,published,archived,sold,rented'],
            'is_active' => ['nullable', 'boolean'],
            'amenities' => ['nullable', 'array'],
            'amenities.*' => ['integer', 'exists:amenities,id'],
            'images' => ['nullable', 'array', 'max:10'],
            'images.*' => ['image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
            'featured_image' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ];
    }
}
