<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreMotoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plate' => 'required|string|max:10|regex:/^[A-Z]{3}-?\d{1}[A-Z0-9]{1}\d{2}$/i',
            'model' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
        ];
    }

    public function messages(): array
    {
        return [
            'plate.required' => 'A placa é obrigatória.',
            'plate.max' => 'A placa deve ter no máximo 10 caracteres.',
            'plate.regex' => 'Formato de placa inválido. Use ABC-1234 ou ABC1D23.',
            'model.max' => 'O modelo deve ter no máximo 100 caracteres.',
            'color.max' => 'A cor deve ter no máximo 50 caracteres.',
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
