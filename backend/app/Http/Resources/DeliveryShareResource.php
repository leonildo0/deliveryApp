<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DeliveryShareResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->iddelivery_share,
            'share_token' => $this->share_token,
            'share_url' => url("/track/{$this->share_token}"),
            'checkout_code' => $this->when($this->checkout_code_visible, $this->checkout_code),
            'checkout_code_visible' => (bool) $this->checkout_code_visible,
            'expires_at' => $this->expires_at,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
