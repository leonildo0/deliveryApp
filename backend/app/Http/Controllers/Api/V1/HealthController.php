<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;

class HealthController extends Controller
{
    #[OA\Get(
        path: "/health",
        summary: "Health check",
        tags: ["Health"],
        responses: [
            new OA\Response(
                response: 200,
                description: "API is running",
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: "status", type: "string", example: "ok"),
                        new OA\Property(property: "timestamp", type: "string", example: "2026-01-29T22:55:00Z"),
                        new OA\Property(property: "database", type: "string", example: "connected"),
                        new OA\Property(property: "version", type: "string", example: "1.0.0")
                    ]
                )
            )
        ]
    )]
    public function index()
    {
        $dbStatus = 'disconnected';
        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
        } catch (\Exception $e) {
            $dbStatus = 'error: ' . $e->getMessage();
        }

        return response()->json([
            'status' => 'ok',
            'timestamp' => now()->toIso8601String(),
            'database' => $dbStatus,
            'version' => '1.0.0',
        ]);
    }
}
