<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MotoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->idmoto,
            'plate' => $this->plate,
            'model' => $this->model,
            'color' => $this->color,
        ];
    }
}
