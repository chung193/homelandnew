<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class PostImportWordpressRequest extends FormRequest
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
            'file' => ['required', 'file', 'mimes:xml', 'max:20480'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'default_status' => ['nullable', 'in:draft,published,pending,archived'],
            'default_type' => ['nullable', 'in:article,news,tutorial,review'],
            'skip_existing' => ['nullable', 'boolean'],
            'allow_comments' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        foreach (['skip_existing', 'allow_comments', 'featured'] as $field) {
            if (!$this->exists($field)) {
                continue;
            }

            $value = $this->input($field);
            if (is_bool($value) || is_int($value)) {
                continue;
            }

            if (!is_string($value)) {
                continue;
            }

            $normalized = strtolower(trim($value));
            if (in_array($normalized, ['1', 'true', 'on', 'yes'], true)) {
                $this->merge([$field => true]);
                continue;
            }

            if (in_array($normalized, ['0', 'false', 'off', 'no'], true)) {
                $this->merge([$field => false]);
                continue;
            }
        }
    }

    public function messages(): array
    {
        return [
            'file.required' => 'Khong nhan duoc file XML. Hay gui request dang multipart/form-data va dung key "file". Neu file lon, kiem tra upload_max_filesize va post_max_size cua PHP.',
            'file.file' => 'Truong "file" phai la file upload.',
            'file.mimes' => 'File import phai co dinh dang .xml.',
            'file.max' => 'File import vuot qua dung luong toi da (20MB).',
            'skip_existing.boolean' => 'skip_existing phai la true/false hoac 1/0.',
            'allow_comments.boolean' => 'allow_comments phai la true/false hoac 1/0.',
            'featured.boolean' => 'featured phai la true/false hoac 1/0.',
        ];
    }
}
