<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EntregaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->identrega,
            'status' => $this->status,
            'checkin_at' => $this->checkin_at,
            'checkout_at' => $this->checkout_at,
            'entregador' => $this->when($this->relationLoaded('entregador'), function () {
                return [
                    'id' => $this->entregador->identregador,
                    'name' => $this->entregador->usuario->name ?? null,
                    'moto' => $this->entregador->moto ? [
                        'plate' => $this->entregador->moto->plate,
                        'model' => $this->entregador->moto->model,
                        'color' => $this->entregador->moto->color,
                    ] : null,
                ];
            }),
            'solicitacao' => new SolicitacaoResource($this->whenLoaded('solicitacao')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
