<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CheckinRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'checkin_code' => 'required|string|size:6',
        ];
    }

    public function messages(): array
    {
        return [
            'checkin_code.required' => 'O código de check-in é obrigatório.',
            'checkin_code.size' => 'O código de check-in deve ter 6 dígitos.',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => 'Erro de validação.',
            'errors' => $validator->errors(),
        ], 422));
    }
}
