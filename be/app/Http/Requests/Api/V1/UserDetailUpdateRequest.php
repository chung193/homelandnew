<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserDetailUpdateRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')
                    ->ignore($this->route('user')),
            ],
            'is_active' => ['nullable', 'boolean'],
            'address' => ['nullable', 'string'],
            'city' => ['nullable', 'string'],
            'phone' => ['nullable', 'string'],
            'description' => ['nullable', 'string'],
            'position' => ['nullable', 'string'],
            'website' => ['nullable', 'string'],
            'github' => ['nullable', 'string'],
            'join_date' => ['nullable', 'date'],
            'birthday' => ['nullable', 'date'],
        ];
    }
}
