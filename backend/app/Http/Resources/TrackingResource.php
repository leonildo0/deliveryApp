<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrackingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $solicitacao = $this->solicitacao;
        $entrega = $solicitacao?->entrega;
        $entregador = $entrega?->entregador;

        return [
            'status' => $entrega?->status ?? $solicitacao?->status ?? 'unknown',
            'solicitacao_status' => $solicitacao?->status,
            'entrega_status' => $entrega?->status,
            'item' => $solicitacao?->item ? [
                'type' => $solicitacao->item->type,
                'notes' => $solicitacao->item->notes,
            ] : null,
            'pickup_location' => $solicitacao?->pickupLocation ? [
                'latitude' => (float) $solicitacao->pickupLocation->latitude,
                'longitude' => (float) $solicitacao->pickupLocation->longitude,
            ] : null,
            'dropoff_location' => $solicitacao?->dropoffLocation ? [
                'latitude' => (float) $solicitacao->dropoffLocation->latitude,
                'longitude' => (float) $solicitacao->dropoffLocation->longitude,
            ] : null,
            'entregador' => $entregador ? [
                'name' => $entregador->usuario->name ?? null,
                'moto' => $entregador->moto ? [
                    'plate' => $entregador->moto->plate,
                    'model' => $entregador->moto->model,
                    'color' => $entregador->moto->color,
                ] : null,
                'current_location' => $entregador->currentLocation ? [
                    'latitude' => (float) $entregador->currentLocation->latitude,
                    'longitude' => (float) $entregador->currentLocation->longitude,
                    'recorded_at' => $entregador->currentLocation->recorded_at?->toISOString(),
                ] : null,
            ] : null,
            'checkout_code' => $this->when($this->checkout_code_visible, $this->checkout_code),
            'checkout_code_visible' => (bool) $this->checkout_code_visible,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
