<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\HealthController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\DelivererController;
use App\Http\Controllers\Api\V1\TrackingController;
use App\Http\Controllers\Api\V1\RootController;

Route::prefix('v1')->middleware('throttle:api')->group(function () {
    // Health check
    Route::get('/health', [HealthController::class, 'index']);

    // Auth routes (public) - stricter rate limiting
    Route::prefix('auth')->middleware('throttle:auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);
    });

    // Auth routes (authenticated)
    Route::middleware('auth:sanctum')->prefix('auth')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });

    // Public tracking route
    Route::get('/track/{token}', [TrackingController::class, 'track']);

    // Client routes
    Route::middleware(['auth:sanctum', 'role:cliente', 'cliente.active'])->prefix('client')->group(function () {
        Route::get('/requests', [ClientController::class, 'index']);
        Route::post('/requests', [ClientController::class, 'store'])->middleware('throttle:sensitive');
        Route::get('/requests/{id}', [ClientController::class, 'show']);
        Route::post('/requests/{id}/cancel', [ClientController::class, 'cancel'])->middleware('throttle:sensitive');
        Route::post('/requests/{id}/share', [ClientController::class, 'share']);
        Route::get('/requests/{id}/tracking', [ClientController::class, 'tracking']);
    });

    // Deliverer routes
    Route::middleware(['auth:sanctum', 'role:entregador'])->prefix('deliverer')->group(function () {
        Route::get('/profile', [DelivererController::class, 'profile']);
        Route::post('/moto', [DelivererController::class, 'storeMoto']);
        Route::put('/moto', [DelivererController::class, 'updateMoto']);
        Route::post('/status', [DelivererController::class, 'updateStatus']);
        Route::post('/location', [DelivererController::class, 'updateLocation'])->middleware('throttle:location');
        Route::get('/available-requests', [DelivererController::class, 'availableRequests']);
        Route::post('/requests/{id}/accept', [DelivererController::class, 'acceptRequest'])->middleware('throttle:sensitive');
        Route::get('/deliveries/current', [DelivererController::class, 'currentDelivery']);
        Route::post('/deliveries/{id}/checkin', [DelivererController::class, 'checkin'])->middleware('throttle:sensitive');
        Route::post('/deliveries/{id}/complete', [DelivererController::class, 'complete'])->middleware('throttle:sensitive');
        Route::post('/deliveries/{id}/cancel', [DelivererController::class, 'cancelDelivery'])->middleware('throttle:sensitive');
    });

    // Root routes
    Route::middleware(['auth:sanctum', 'role:root'])->prefix('root')->group(function () {
        Route::get('/logs', [RootController::class, 'logs']);
        Route::get('/stats', [RootController::class, 'stats']);
        Route::get('/users', [RootController::class, 'users']);
        Route::get('/deliveries', [RootController::class, 'deliveries']);
        Route::get('/status-history', [RootController::class, 'statusHistory']);
    });
});
