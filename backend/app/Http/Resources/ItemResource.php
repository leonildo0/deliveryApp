<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->iditem,
            'type' => $this->type,
            'weight_kg' => $this->weight_kg ? (float) $this->weight_kg : null,
            'height_cm' => $this->height_cm ? (float) $this->height_cm : null,
            'width_cm' => $this->width_cm ? (float) $this->width_cm : null,
            'length_cm' => $this->length_cm ? (float) $this->length_cm : null,
            'notes' => $this->notes,
        ];
    }
}
