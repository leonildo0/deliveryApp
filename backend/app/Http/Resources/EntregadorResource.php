<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EntregadorResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->identregador,
            'status' => $this->status,
            'moto' => new MotoResource($this->whenLoaded('moto')),
            'current_location' => new LocationResource($this->whenLoaded('currentLocation')),
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
