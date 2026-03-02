<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureClienteIsActive
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->isCliente()) {
            $cliente = $user->cliente;
            if ($cliente && $cliente->status === 'blocked') {
                return response()->json([
                    'message' => 'Your account has been blocked.',
                ], 403);
            }
        }

        return $next($request);
    }
}
