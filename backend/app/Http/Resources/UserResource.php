<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->idusuario,
            'name' => $this->name,
            'email' => $this->email,
            'role' => $this->role,
            'created_at' => $this->created_at?->toISOString(),
            'profile' => $this->when($this->role === 'cliente', fn() => new ClienteResource($this->cliente)),
            'profile' => $this->when($this->role === 'entregador', fn() => new EntregadorResource($this->entregador)),
        ];
    }
}
