<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Solicitacao;
use App\Models\Item;
use App\Models\Location;
use App\Models\DeliveryShare;
use App\Models\StatusHistory;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class ClientController extends Controller
{
    #[OA\Get(
        path: "/client/requests",
        summary: "List client's delivery requests",
        tags: ["Client"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "List of requests",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "requests", type: "array", items: new OA\Items(type: "object")),
                    ]
                )
            ),
        ]
    )]
    public function index(Request $request)
    {
        $cliente = $request->user()->cliente;
        $requests = $cliente->solicitacoes()
            ->with(['item', 'pickupLocation', 'dropoffLocation', 'entrega.entregador.usuario', 'deliveryShare'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'requests' => $requests,
        ]);
    }

    #[OA\Post(
        path: "/client/requests",
        summary: "Create a new delivery request",
        tags: ["Client"],
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["item", "pickup_location", "dropoff_location"],
                properties: [
                    new OA\Property(
                        property: "item",
                        type: "object",
                        required: ["type"],
                        properties: [
                            new OA\Property(property: "type", type: "string", example: "Documento"),
                            new OA\Property(property: "weight_kg", type: "number", example: 0.5),
                            new OA\Property(property: "height_cm", type: "number", example: 30),
                            new OA\Property(property: "width_cm", type: "number", example: 20),
                            new OA\Property(property: "length_cm", type: "number", example: 5),
                            new OA\Property(property: "notes", type: "string", example: "Frágil"),
                        ]
                    ),
                    new OA\Property(
                        property: "pickup_location",
                        type: "object",
                        required: ["latitude", "longitude"],
                        properties: [
                            new OA\Property(property: "latitude", type: "number", example: -23.550520),
                            new OA\Property(property: "longitude", type: "number", example: -46.633308),
                        ]
                    ),
                    new OA\Property(
                        property: "dropoff_location",
                        type: "object",
                        required: ["latitude", "longitude"],
                        properties: [
                            new OA\Property(property: "latitude", type: "number", example: -23.561414),
                            new OA\Property(property: "longitude", type: "number", example: -46.656166),
                        ]
                    ),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Request created"),
            new OA\Response(response: 400, description: "Client already has active request"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function store(Request $request)
    {
        $cliente = $request->user()->cliente;

        if ($cliente->hasActiveRequest()) {
            return response()->json([
                'message' => 'You already have an active delivery request.',
            ], 400);
        }

        $validated = $request->validate([
            'item.type' => 'required|string|max:255',
            'item.weight_kg' => 'nullable|numeric|min:0',
            'item.height_cm' => 'nullable|numeric|min:0',
            'item.width_cm' => 'nullable|numeric|min:0',
            'item.length_cm' => 'nullable|numeric|min:0',
            'item.notes' => 'nullable|string|max:1000',
            'pickup_location.latitude' => 'required|numeric|between:-90,90',
            'pickup_location.longitude' => 'required|numeric|between:-180,180',
            'dropoff_location.latitude' => 'required|numeric|between:-90,90',
            'dropoff_location.longitude' => 'required|numeric|between:-180,180',
        ]);

        // Create item
        $item = Item::create($validated['item']);

        // Create locations
        $pickupLocation = Location::create([
            'latitude' => $validated['pickup_location']['latitude'],
            'longitude' => $validated['pickup_location']['longitude'],
            'source_type' => 'request',
        ]);

        $dropoffLocation = Location::create([
            'latitude' => $validated['dropoff_location']['latitude'],
            'longitude' => $validated['dropoff_location']['longitude'],
            'source_type' => 'request',
        ]);

        // Create solicitacao
        $solicitacao = Solicitacao::create([
            'cliente_id' => $cliente->idcliente,
            'status' => 'requested',
            'item_id' => $item->iditem,
            'pickup_location_id' => $pickupLocation->idlocation,
            'dropoff_location_id' => $dropoffLocation->idlocation,
        ]);

        // Record status history
        StatusHistory::recordChange(
            'solicitacao',
            $solicitacao->idsolicitacao,
            null,
            'requested',
            $request->user()->idusuario
        );

        $solicitacao->load(['item', 'pickupLocation', 'dropoffLocation']);

        return response()->json([
            'message' => 'Delivery request created successfully',
            'request' => $solicitacao,
        ], 201);
    }

    #[OA\Get(
        path: "/client/requests/{id}",
        summary: "Get request details",
        tags: ["Client"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Request details"),
            new OA\Response(response: 404, description: "Request not found"),
        ]
    )]
    public function show(Request $request, int $id)
    {
        $cliente = $request->user()->cliente;
        $solicitacao = $cliente->solicitacoes()
            ->with(['item', 'pickupLocation', 'dropoffLocation', 'entrega.entregador.usuario', 'entrega.entregador.moto', 'deliveryShare'])
            ->find($id);

        if (!$solicitacao) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        return response()->json([
            'request' => $solicitacao,
        ]);
    }

    #[OA\Post(
        path: "/client/requests/{id}/cancel",
        summary: "Cancel a request",
        tags: ["Client"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Request canceled"),
            new OA\Response(response: 400, description: "Cannot cancel this request"),
            new OA\Response(response: 404, description: "Request not found"),
        ]
    )]
    public function cancel(Request $request, int $id)
    {
        $cliente = $request->user()->cliente;
        $solicitacao = $cliente->solicitacoes()->find($id);

        if (!$solicitacao) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if (!$solicitacao->canBeCanceled()) {
            return response()->json([
                'message' => 'This request cannot be canceled. It may have already been accepted.',
            ], 400);
        }

        $oldStatus = $solicitacao->status;
        $solicitacao->update(['status' => 'canceled']);

        StatusHistory::recordChange(
            'solicitacao',
            $solicitacao->idsolicitacao,
            $oldStatus,
            'canceled',
            $request->user()->idusuario
        );

        return response()->json([
            'message' => 'Request canceled successfully',
            'request' => $solicitacao,
        ]);
    }

    #[OA\Post(
        path: "/client/requests/{id}/share",
        summary: "Generate share link for tracking",
        tags: ["Client"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Share link generated",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "share_token", type: "string"),
                        new OA\Property(property: "share_url", type: "string"),
                    ]
                )
            ),
            new OA\Response(response: 400, description: "Cannot share this request"),
            new OA\Response(response: 404, description: "Request not found"),
        ]
    )]
    public function share(Request $request, int $id)
    {
        $cliente = $request->user()->cliente;
        $solicitacao = $cliente->solicitacoes()->with('entrega')->find($id);

        if (!$solicitacao) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        // Can only share after delivery started (in_progress)
        if (!$solicitacao->entrega || $solicitacao->entrega->status !== 'in_progress') {
            return response()->json([
                'message' => 'Can only share after delivery has started.',
            ], 400);
        }

        // Check if share already exists
        $share = $solicitacao->deliveryShare;
        if (!$share) {
            $share = DeliveryShare::create([
                'solicitacao_id' => $solicitacao->idsolicitacao,
                'checkout_code_visible' => true,
            ]);
        }

        $shareUrl = config('app.frontend_url', 'http://localhost:3000') . '/track/' . $share->share_token;

        return response()->json([
            'share_token' => $share->share_token,
            'share_url' => $shareUrl,
            'checkout_code' => $share->checkout_code,
        ]);
    }

    #[OA\Get(
        path: "/client/requests/{id}/tracking",
        summary: "Get deliverer location for tracking",
        tags: ["Client"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: "Deliverer location",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "latitude", type: "number"),
                        new OA\Property(property: "longitude", type: "number"),
                        new OA\Property(property: "updated_at", type: "string"),
                    ]
                )
            ),
            new OA\Response(response: 400, description: "No active delivery"),
            new OA\Response(response: 404, description: "Request not found"),
        ]
    )]
    public function tracking(Request $request, int $id)
    {
        $cliente = $request->user()->cliente;
        $solicitacao = $cliente->solicitacoes()
            ->with('entrega.entregador.currentLocation')
            ->find($id);

        if (!$solicitacao) {
            return response()->json(['message' => 'Request not found'], 404);
        }

        if (!$solicitacao->entrega || !$solicitacao->entrega->isActive()) {
            return response()->json([
                'message' => 'No active delivery for this request.',
            ], 400);
        }

        $location = $solicitacao->entrega->entregador->currentLocation;

        if (!$location) {
            return response()->json([
                'message' => 'Deliverer location not available yet.',
                'latitude' => null,
                'longitude' => null,
            ]);
        }

        return response()->json([
            'latitude' => $location->latitude,
            'longitude' => $location->longitude,
            'updated_at' => $location->recorded_at,
            'delivery_status' => $solicitacao->entrega->status,
        ]);
    }
}
