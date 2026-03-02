<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SolicitacaoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->idsolicitacao,
            'status' => $this->status,
            'checkin_code' => $this->checkin_code,
            'item' => new ItemResource($this->whenLoaded('item')),
            'pickup_location' => new LocationResource($this->whenLoaded('pickupLocation')),
            'dropoff_location' => new LocationResource($this->whenLoaded('dropoffLocation')),
            'cliente' => $this->when($this->relationLoaded('cliente'), function () {
                return [
                    'id' => $this->cliente->idcliente,
                    'name' => $this->cliente->usuario->name ?? null,
                ];
            }),
            'entrega' => new EntregaResource($this->whenLoaded('entrega')),
            'share' => new DeliveryShareResource($this->whenLoaded('share')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
