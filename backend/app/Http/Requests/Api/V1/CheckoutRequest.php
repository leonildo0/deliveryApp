<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CheckoutRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'checkout_code' => 'required|string|size:6',
        ];
    }

    public function messages(): array
    {
        return [
            'checkout_code.required' => 'O código de checkout é obrigatório.',
            'checkout_code.size' => 'O código de checkout deve ter 6 dígitos.',
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
