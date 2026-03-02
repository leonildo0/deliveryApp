<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CreateRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'item.type' => 'required|string|max:255',
            'item.weight_kg' => 'nullable|numeric|min:0',
            'item.height_cm' => 'nullable|numeric|min:0',
            'item.width_cm' => 'nullable|numeric|min:0',
            'item.length_cm' => 'nullable|numeric|min:0',
            'item.notes' => 'nullable|string|max:500',
            'pickup_location.latitude' => 'required|numeric|between:-90,90',
            'pickup_location.longitude' => 'required|numeric|between:-180,180',
            'dropoff_location.latitude' => 'required|numeric|between:-90,90',
            'dropoff_location.longitude' => 'required|numeric|between:-180,180',
        ];
    }

    public function messages(): array
    {
        return [
            'item.type.required' => 'O tipo do item é obrigatório.',
            'item.type.max' => 'O tipo do item deve ter no máximo 255 caracteres.',
            'item.weight_kg.numeric' => 'O peso deve ser um número.',
            'item.weight_kg.min' => 'O peso deve ser positivo.',
            'item.notes.max' => 'As observações devem ter no máximo 500 caracteres.',
            'pickup_location.latitude.required' => 'A latitude de retirada é obrigatória.',
            'pickup_location.latitude.between' => 'A latitude de retirada deve estar entre -90 e 90.',
            'pickup_location.longitude.required' => 'A longitude de retirada é obrigatória.',
            'pickup_location.longitude.between' => 'A longitude de retirada deve estar entre -180 e 180.',
            'dropoff_location.latitude.required' => 'A latitude de entrega é obrigatória.',
            'dropoff_location.latitude.between' => 'A latitude de entrega deve estar entre -90 e 90.',
            'dropoff_location.longitude.required' => 'A longitude de entrega é obrigatória.',
            'dropoff_location.longitude.between' => 'A longitude de entrega deve estar entre -180 e 180.',
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

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $pickup = $this->input('pickup_location');
            $dropoff = $this->input('dropoff_location');

            if ($pickup && $dropoff) {
                if ($pickup['latitude'] == $dropoff['latitude'] && 
                    $pickup['longitude'] == $dropoff['longitude']) {
                    $validator->errors()->add('dropoff_location', 'O local de entrega deve ser diferente do local de retirada.');
                }
            }
        });
    }
}
