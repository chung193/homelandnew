<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class PostStoreRequest extends FormRequest
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
            'name' => ['required', 'string'],
            'description' => ['string'],
            'content' => ['required', 'string', 'min:8'],
            'category_id' => ['required'],
            'slug' => ['string'],
            'status' => ['required', 'string'],
            'type' => ['required', 'string'],
            'views' => ['integer'],
            'published_at' => ['required'],
            'featured' => ['required', 'boolean'],
            'allow_comments' => ['required', 'boolean'],
            'featured_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'tags' => ['sometimes', 'array'],
            'tags.*' => ['nullable'],
        ];
    }
}
