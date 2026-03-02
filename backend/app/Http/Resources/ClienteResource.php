<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ClienteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->idcliente,
            'status' => $this->status,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
