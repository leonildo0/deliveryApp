<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Moto;
use App\Models\Location;
use App\Models\Solicitacao;
use App\Models\Entrega;
use App\Models\StatusHistory;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class DelivererController extends Controller
{
    #[OA\Get(
        path: "/deliverer/profile",
        summary: "Get deliverer profile with motorcycle",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(response: 200, description: "Deliverer profile"),
        ]
    )]
    public function profile(Request $request)
    {
        $entregador = $request->user()->entregador;
        $entregador->load(['moto', 'currentLocation']);

        return response()->json([
            'profile' => $entregador,
            'user' => $request->user()->only(['idusuario', 'name', 'email']),
        ]);
    }

    #[OA\Post(
        path: "/deliverer/moto",
        summary: "Register motorcycle",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["plate"],
                properties: [
                    new OA\Property(property: "plate", type: "string", example: "ABC-1234"),
                    new OA\Property(property: "model", type: "string", example: "Honda CG 160"),
                    new OA\Property(property: "color", type: "string", example: "Vermelha"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 201, description: "Motorcycle registered"),
            new OA\Response(response: 400, description: "Already has motorcycle"),
            new OA\Response(response: 422, description: "Validation error"),
        ]
    )]
    public function storeMoto(Request $request)
    {
        $entregador = $request->user()->entregador;

        if ($entregador->moto) {
            return response()->json([
                'message' => 'You already have a registered motorcycle. Use PUT to update.',
            ], 400);
        }

        $validated = $request->validate([
            'plate' => 'required|string|max:20',
            'model' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
        ]);

        $moto = Moto::create([
            'entregador_id' => $entregador->identregador,
            ...$validated,
        ]);

        return response()->json([
            'message' => 'Motorcycle registered successfully',
            'moto' => $moto,
        ], 201);
    }

    #[OA\Put(
        path: "/deliverer/moto",
        summary: "Update motorcycle",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: "plate", type: "string", example: "ABC-1234"),
                    new OA\Property(property: "model", type: "string", example: "Honda CG 160"),
                    new OA\Property(property: "color", type: "string", example: "Vermelha"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Motorcycle updated"),
            new OA\Response(response: 404, description: "No motorcycle registered"),
        ]
    )]
    public function updateMoto(Request $request)
    {
        $entregador = $request->user()->entregador;

        if (!$entregador->moto) {
            return response()->json([
                'message' => 'No motorcycle registered. Use POST to create.',
            ], 404);
        }

        $validated = $request->validate([
            'plate' => 'sometimes|string|max:20',
            'model' => 'nullable|string|max:100',
            'color' => 'nullable|string|max:50',
        ]);

        $entregador->moto->update($validated);

        return response()->json([
            'message' => 'Motorcycle updated successfully',
            'moto' => $entregador->moto,
        ]);
    }

    #[OA\Post(
        path: "/deliverer/status",
        summary: "Toggle online/offline status",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["status"],
                properties: [
                    new OA\Property(property: "status", type: "string", enum: ["online", "offline"], example: "online"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Status updated"),
            new OA\Response(response: 400, description: "Cannot change status while busy"),
        ]
    )]
    public function updateStatus(Request $request)
    {
        $entregador = $request->user()->entregador;

        if ($entregador->isBusy()) {
            return response()->json([
                'message' => 'Cannot change status while on active delivery.',
            ], 400);
        }

        $validated = $request->validate([
            'status' => 'required|in:online,offline',
        ]);

        $oldStatus = $entregador->status;
        $entregador->update(['status' => $validated['status']]);

        StatusHistory::recordChange(
            'entregador',
            $entregador->identregador,
            $oldStatus,
            $validated['status'],
            $request->user()->idusuario
        );

        return response()->json([
            'message' => 'Status updated successfully',
            'status' => $entregador->status,
        ]);
    }

    #[OA\Post(
        path: "/deliverer/location",
        summary: "Update current location",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["latitude", "longitude"],
                properties: [
                    new OA\Property(property: "latitude", type: "number", example: -23.550520),
                    new OA\Property(property: "longitude", type: "number", example: -46.633308),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Location updated"),
        ]
    )]
    public function updateLocation(Request $request)
    {
        $entregador = $request->user()->entregador;

        $validated = $request->validate([
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        $location = Location::create([
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'source_type' => 'deliverer',
            'recorded_at' => now(),
        ]);

        $entregador->update(['current_location_id' => $location->idlocation]);

        return response()->json([
            'message' => 'Location updated successfully',
            'location' => $location,
        ]);
    }

    #[OA\Get(
        path: "/deliverer/available-requests",
        summary: "List available delivery requests",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(response: 200, description: "List of available requests"),
            new OA\Response(response: 400, description: "Must be online to see requests"),
        ]
    )]
    public function availableRequests(Request $request)
    {
        $entregador = $request->user()->entregador;

        if (!$entregador->isOnline() && !$entregador->isBusy()) {
            return response()->json([
                'message' => 'You must be online to see available requests.',
            ], 400);
        }

        $requests = Solicitacao::where('status', 'requested')
            ->with(['item', 'pickupLocation', 'dropoffLocation', 'cliente.usuario'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'requests' => $requests,
        ]);
    }

    #[OA\Post(
        path: "/deliverer/requests/{id}/accept",
        summary: "Accept a delivery request",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Request accepted"),
            new OA\Response(response: 400, description: "Cannot accept request"),
            new OA\Response(response: 404, description: "Request not found"),
        ]
    )]
    public function acceptRequest(Request $request, int $id)
    {
        $entregador = $request->user()->entregador;

        if ($entregador->hasActiveDelivery()) {
            return response()->json([
                'message' => 'You already have an active delivery.',
            ], 400);
        }

        if (!$entregador->moto) {
            return response()->json([
                'message' => 'You must register a motorcycle first.',
            ], 400);
        }

        $solicitacao = Solicitacao::where('status', 'requested')->find($id);

        if (!$solicitacao) {
            return response()->json([
                'message' => 'Request not found or no longer available.',
            ], 404);
        }

        // Update solicitacao status
        $oldSolicitacaoStatus = $solicitacao->status;
        $solicitacao->update(['status' => 'accepted']);

        StatusHistory::recordChange(
            'solicitacao',
            $solicitacao->idsolicitacao,
            $oldSolicitacaoStatus,
            'accepted',
            $request->user()->idusuario
        );

        // Create entrega
        $entrega = Entrega::create([
            'entregador_id' => $entregador->identregador,
            'solicitacao_id' => $solicitacao->idsolicitacao,
            'status' => 'checkin_pending',
        ]);

        StatusHistory::recordChange(
            'entrega',
            $entrega->identrega,
            null,
            'checkin_pending',
            $request->user()->idusuario
        );

        // Update entregador status to busy
        $oldEntregadorStatus = $entregador->status;
        $entregador->update(['status' => 'busy']);

        StatusHistory::recordChange(
            'entregador',
            $entregador->identregador,
            $oldEntregadorStatus,
            'busy',
            $request->user()->idusuario
        );

        $entrega->load(['solicitacao.item', 'solicitacao.pickupLocation', 'solicitacao.dropoffLocation']);

        return response()->json([
            'message' => 'Request accepted successfully',
            'delivery' => $entrega,
        ]);
    }

    #[OA\Get(
        path: "/deliverer/deliveries/current",
        summary: "Get current active delivery",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(response: 200, description: "Current delivery"),
            new OA\Response(response: 404, description: "No active delivery"),
        ]
    )]
    public function currentDelivery(Request $request)
    {
        $entregador = $request->user()->entregador;
        $entrega = $entregador->getActiveDelivery();

        if (!$entrega) {
            return response()->json([
                'message' => 'No active delivery.',
                'delivery' => null,
            ]);
        }

        $entrega->load([
            'solicitacao.item',
            'solicitacao.pickupLocation',
            'solicitacao.dropoffLocation',
            'solicitacao.cliente.usuario',
            'solicitacao.deliveryShare',
        ]);

        return response()->json([
            'delivery' => $entrega,
        ]);
    }

    #[OA\Post(
        path: "/deliverer/deliveries/{id}/checkin",
        summary: "Check in to start delivery",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["checkin_code"],
                properties: [
                    new OA\Property(property: "checkin_code", type: "string", example: "ABC123"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Checked in successfully"),
            new OA\Response(response: 400, description: "Invalid check-in code or cannot check in"),
            new OA\Response(response: 404, description: "Delivery not found"),
        ]
    )]
    public function checkin(Request $request, int $id)
    {
        $entregador = $request->user()->entregador;
        $entrega = $entregador->entregas()->with('solicitacao')->find($id);

        if (!$entrega) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        if (!$entrega->canCheckin()) {
            return response()->json([
                'message' => 'Cannot check in. Delivery is not in checkin_pending status.',
            ], 400);
        }

        $validated = $request->validate([
            'checkin_code' => 'required|string',
        ]);

        if (strtoupper($validated['checkin_code']) !== $entrega->solicitacao->checkin_code) {
            return response()->json([
                'message' => 'Invalid check-in code.',
            ], 400);
        }

        $oldStatus = $entrega->status;
        $entrega->update([
            'status' => 'in_progress',
            'checkin_at' => now(),
        ]);

        StatusHistory::recordChange(
            'entrega',
            $entrega->identrega,
            $oldStatus,
            'in_progress',
            $request->user()->idusuario
        );

        return response()->json([
            'message' => 'Checked in successfully. Delivery started.',
            'delivery' => $entrega,
        ]);
    }

    #[OA\Post(
        path: "/deliverer/deliveries/{id}/complete",
        summary: "Complete delivery with checkout code",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ["checkout_code"],
                properties: [
                    new OA\Property(property: "checkout_code", type: "string", example: "XYZ789"),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: "Delivery completed"),
            new OA\Response(response: 400, description: "Invalid checkout code or cannot complete"),
            new OA\Response(response: 404, description: "Delivery not found"),
        ]
    )]
    public function complete(Request $request, int $id)
    {
        $entregador = $request->user()->entregador;
        $entrega = $entregador->entregas()->with('solicitacao.deliveryShare')->find($id);

        if (!$entrega) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        if (!$entrega->canComplete()) {
            return response()->json([
                'message' => 'Cannot complete. Delivery is not in progress.',
            ], 400);
        }

        $validated = $request->validate([
            'checkout_code' => 'required|string',
        ]);

        $deliveryShare = $entrega->solicitacao->deliveryShare;
        if (!$deliveryShare) {
            return response()->json([
                'message' => 'No share link created. Client must share the tracking link first.',
            ], 400);
        }

        if (strtoupper($validated['checkout_code']) !== $deliveryShare->checkout_code) {
            return response()->json([
                'message' => 'Invalid checkout code.',
            ], 400);
        }

        // Complete entrega
        $oldEntregaStatus = $entrega->status;
        $entrega->update([
            'status' => 'completed',
            'checkout_at' => now(),
        ]);

        StatusHistory::recordChange(
            'entrega',
            $entrega->identrega,
            $oldEntregaStatus,
            'completed',
            $request->user()->idusuario
        );

        // Update solicitacao to fulfilled
        $solicitacao = $entrega->solicitacao;
        $oldSolicitacaoStatus = $solicitacao->status;
        $solicitacao->update(['status' => 'fulfilled']);

        StatusHistory::recordChange(
            'solicitacao',
            $solicitacao->idsolicitacao,
            $oldSolicitacaoStatus,
            'fulfilled',
            $request->user()->idusuario
        );

        // Update entregador status to online
        $oldEntregadorStatus = $entregador->status;
        $entregador->update(['status' => 'online']);

        StatusHistory::recordChange(
            'entregador',
            $entregador->identregador,
            $oldEntregadorStatus,
            'online',
            $request->user()->idusuario
        );

        return response()->json([
            'message' => 'Delivery completed successfully!',
            'delivery' => $entrega,
        ]);
    }

    #[OA\Post(
        path: "/deliverer/deliveries/{id}/cancel",
        summary: "Cancel active delivery",
        tags: ["Deliverer"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "id", in: "path", required: true, schema: new OA\Schema(type: "integer")),
        ],
        responses: [
            new OA\Response(response: 200, description: "Delivery canceled"),
            new OA\Response(response: 400, description: "Cannot cancel"),
            new OA\Response(response: 404, description: "Delivery not found"),
        ]
    )]
    public function cancelDelivery(Request $request, int $id)
    {
        $entregador = $request->user()->entregador;
        $entrega = $entregador->entregas()->with('solicitacao')->find($id);

        if (!$entrega) {
            return response()->json(['message' => 'Delivery not found'], 404);
        }

        if (!$entrega->canBeCanceled()) {
            return response()->json([
                'message' => 'Cannot cancel this delivery.',
            ], 400);
        }

        // Cancel entrega
        $oldEntregaStatus = $entrega->status;
        $entrega->update(['status' => 'canceled']);

        StatusHistory::recordChange(
            'entrega',
            $entrega->identrega,
            $oldEntregaStatus,
            'canceled',
            $request->user()->idusuario
        );

        // Revert solicitacao to requested so another deliverer can pick it up
        $solicitacao = $entrega->solicitacao;
        $oldSolicitacaoStatus = $solicitacao->status;
        $solicitacao->update(['status' => 'requested']);

        StatusHistory::recordChange(
            'solicitacao',
            $solicitacao->idsolicitacao,
            $oldSolicitacaoStatus,
            'requested',
            $request->user()->idusuario
        );

        // Update entregador status to online
        $oldEntregadorStatus = $entregador->status;
        $entregador->update(['status' => 'online']);

        StatusHistory::recordChange(
            'entregador',
            $entregador->identregador,
            $oldEntregadorStatus,
            'online',
            $request->user()->idusuario
        );

        return response()->json([
            'message' => 'Delivery canceled. Request is available again.',
            'delivery' => $entrega,
        ]);
    }
}
