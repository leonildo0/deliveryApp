<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Solicitacao;
use App\Models\DeliveryShare;
use OpenApi\Attributes as OA;

class TrackingController extends Controller
{
    #[OA\Get(
        path: "/track/{token}",
        summary: "Get delivery status and location by share token (public)",
        tags: ["Tracking"],
        parameters: [
            new OA\Parameter(name: "token", in: "path", required: true, schema: new OA\Schema(type: "string")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Delivery tracking info",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "status", type: "string"),
                        new OA\Property(property: "deliverer_location", type: "object"),
                        new OA\Property(property: "pickup_location", type: "object"),
                        new OA\Property(property: "dropoff_location", type: "object"),
                        new OA\Property(property: "checkout_code", type: "string", nullable: true),
                    ]
                )
            ),
            new OA\Response(response: 404, description: "Invalid or expired share link"),
        ]
    )]
    public function track(string $token)
    {
        $share = DeliveryShare::where('share_token', $token)
            ->with([
                'solicitacao.entrega.entregador.currentLocation',
                'solicitacao.pickupLocation',
                'solicitacao.dropoffLocation',
                'solicitacao.item',
            ])
            ->first();

        if (!$share) {
            return response()->json([
                'message' => 'Invalid share link.',
            ], 404);
        }

        if ($share->isExpired()) {
            return response()->json([
                'message' => 'This share link has expired.',
            ], 404);
        }

        $solicitacao = $share->solicitacao;
        $entrega = $solicitacao->entrega;
        $delivererLocation = null;

        if ($entrega && $entrega->entregador && $entrega->entregador->currentLocation) {
            $loc = $entrega->entregador->currentLocation;
            $delivererLocation = [
                'latitude' => $loc->latitude,
                'longitude' => $loc->longitude,
                'updated_at' => $loc->recorded_at,
            ];
        }

        return response()->json([
            'request_status' => $solicitacao->status,
            'delivery_status' => $entrega?->status,
            'item' => [
                'type' => $solicitacao->item->type,
                'notes' => $solicitacao->item->notes,
            ],
            'pickup_location' => [
                'latitude' => $solicitacao->pickupLocation->latitude,
                'longitude' => $solicitacao->pickupLocation->longitude,
            ],
            'dropoff_location' => [
                'latitude' => $solicitacao->dropoffLocation->latitude,
                'longitude' => $solicitacao->dropoffLocation->longitude,
            ],
            'deliverer_location' => $delivererLocation,
            'checkout_code' => $share->checkout_code_visible ? $share->checkout_code : null,
            'checkin_at' => $entrega?->checkin_at,
            'checkout_at' => $entrega?->checkout_at,
        ]);
    }
}
