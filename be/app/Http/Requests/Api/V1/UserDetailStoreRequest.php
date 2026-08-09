<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class UserDetailStoreRequest extends FormRequest
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
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'string', 'min:8'],
            'address' => ['string'],
            'city' => ['string'],
            'description' => ['string', 'min:8'],
            'position' => ['string', 'min:8'],
            'website' => ['string', 'min:8'],
            'github' => ['string', 'min:8'],
            'join_date' => ['string', 'min:8'],
            'birthday' => ['date'],
        ];
    }
}
