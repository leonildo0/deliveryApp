<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: "1.0.0",
    title: "DeliveryApp API",
    description: "API for delivery management system",
    contact: new OA\Contact(email: "admin@deliveryapp.com")
)]
#[OA\Server(
    url: "/api/v1",
    description: "API Server"
)]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Enter your Sanctum token"
)]
abstract class Controller
{
    //
}
