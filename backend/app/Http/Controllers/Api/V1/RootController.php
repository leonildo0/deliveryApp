<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Usuario;
use App\Models\Solicitacao;
use App\Models\Entrega;
use App\Models\Location;
use App\Models\StatusHistory;
use Illuminate\Http\Request;
use OpenApi\Attributes as OA;

class RootController extends Controller
{
    #[OA\Get(
        path: "/root/logs",
        summary: "Get canceled requests log",
        tags: ["Root"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "page", in: "query", schema: new OA\Schema(type: "integer", default: 1)),
            new OA\Parameter(name: "per_page", in: "query", schema: new OA\Schema(type: "integer", default: 20)),
        ],
        responses: [
            new OA\Response(response: 200, description: "Canceled requests log"),
        ]
    )]
    public function logs(Request $request)
    {
        $perPage = $request->input('per_page', 20);

        $canceledRequests = StatusHistory::where('entity_type', 'solicitacao')
            ->where('new_status', 'canceled')
            ->with('changedBy')
            ->orderBy('changed_at', 'desc')
            ->paginate($perPage);

        $canceledDeliveries = StatusHistory::where('entity_type', 'entrega')
            ->where('new_status', 'canceled')
            ->with('changedBy')
            ->orderBy('changed_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'canceled_requests' => $canceledRequests,
            'canceled_deliveries' => $canceledDeliveries,
        ]);
    }

    #[OA\Get(
        path: "/root/stats",
        summary: "Get system statistics",
        tags: ["Root"],
        security: [["sanctum" => []]],
        responses: [
            new OA\Response(
                response: 200,
                description: "System statistics",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "users", type: "object"),
                        new OA\Property(property: "requests", type: "object"),
                        new OA\Property(property: "deliveries", type: "object"),
                        new OA\Property(property: "locations", type: "integer"),
                    ]
                )
            ),
        ]
    )]
    public function stats()
    {
        $stats = [
            'users' => [
                'total' => Usuario::count(),
                'clientes' => Usuario::where('role', 'cliente')->count(),
                'entregadores' => Usuario::where('role', 'entregador')->count(),
                'roots' => Usuario::where('role', 'root')->count(),
            ],
            'requests' => [
                'total' => Solicitacao::count(),
                'requested' => Solicitacao::where('status', 'requested')->count(),
                'accepted' => Solicitacao::where('status', 'accepted')->count(),
                'canceled' => Solicitacao::where('status', 'canceled')->count(),
                'fulfilled' => Solicitacao::where('status', 'fulfilled')->count(),
                'expired' => Solicitacao::where('status', 'expired')->count(),
            ],
            'deliveries' => [
                'total' => Entrega::count(),
                'checkin_pending' => Entrega::where('status', 'checkin_pending')->count(),
                'in_progress' => Entrega::where('status', 'in_progress')->count(),
                'completed' => Entrega::where('status', 'completed')->count(),
                'canceled' => Entrega::where('status', 'canceled')->count(),
            ],
            'locations' => Location::count(),
        ];

        return response()->json($stats);
    }

    #[OA\Get(
        path: "/root/users",
        summary: "List all users",
        tags: ["Root"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "role", in: "query", schema: new OA\Schema(type: "string", enum: ["root", "cliente", "entregador"])),
            new OA\Parameter(name: "page", in: "query", schema: new OA\Schema(type: "integer", default: 1)),
            new OA\Parameter(name: "per_page", in: "query", schema: new OA\Schema(type: "integer", default: 20)),
        ],
        responses: [
            new OA\Response(response: 200, description: "List of users"),
        ]
    )]
    public function users(Request $request)
    {
        $query = Usuario::query();

        if ($request->has('role')) {
            $query->where('role', $request->input('role'));
        }

        $perPage = $request->input('per_page', 20);
        $users = $query->with(['cliente', 'entregador.moto', 'root'])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($users);
    }

    #[OA\Get(
        path: "/root/deliveries",
        summary: "List all deliveries with filters",
        tags: ["Root"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "status", in: "query", schema: new OA\Schema(type: "string", enum: ["checkin_pending", "in_progress", "completed", "canceled"])),
            new OA\Parameter(name: "page", in: "query", schema: new OA\Schema(type: "integer", default: 1)),
            new OA\Parameter(name: "per_page", in: "query", schema: new OA\Schema(type: "integer", default: 20)),
        ],
        responses: [
            new OA\Response(response: 200, description: "List of deliveries"),
        ]
    )]
    public function deliveries(Request $request)
    {
        $query = Entrega::query();

        if ($request->has('status')) {
            $query->where('status', $request->input('status'));
        }

        $perPage = $request->input('per_page', 20);
        $deliveries = $query->with([
            'entregador.usuario',
            'entregador.moto',
            'solicitacao.cliente.usuario',
            'solicitacao.item',
            'solicitacao.pickupLocation',
            'solicitacao.dropoffLocation',
        ])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json($deliveries);
    }

    #[OA\Get(
        path: "/root/status-history",
        summary: "Get full status history",
        tags: ["Root"],
        security: [["sanctum" => []]],
        parameters: [
            new OA\Parameter(name: "entity_type", in: "query", schema: new OA\Schema(type: "string", enum: ["cliente", "entregador", "solicitacao", "entrega"])),
            new OA\Parameter(name: "page", in: "query", schema: new OA\Schema(type: "integer", default: 1)),
            new OA\Parameter(name: "per_page", in: "query", schema: new OA\Schema(type: "integer", default: 50)),
        ],
        responses: [
            new OA\Response(response: 200, description: "Status history"),
        ]
    )]
    public function statusHistory(Request $request)
    {
        $query = StatusHistory::query();

        if ($request->has('entity_type')) {
            $query->where('entity_type', $request->input('entity_type'));
        }

        $perPage = $request->input('per_page', 50);
        $history = $query->with('changedBy')
            ->orderBy('changed_at', 'desc')
            ->paginate($perPage);

        return response()->json($history);
    }
}
