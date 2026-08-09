<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class PageUpdateRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'string'],
            'content' => ['sometimes', 'string', 'min:8'],
            'slug' => ['sometimes', 'string'],
            'status' => ['sometimes', 'string'],
            'type' => ['sometimes', 'string'],
            'views' => ['sometimes', 'integer'],
            'published_at' => ['sometimes'],
            'featured' => ['sometimes', 'boolean'],
            'allow_comments' => ['sometimes', 'boolean'],
            'featured_media_id' => ['nullable', 'integer', 'exists:media,id'],
        ];
    }
}
