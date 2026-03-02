<?php

namespace Tests\Feature\Api;

use App\Models\Usuario;
use App\Models\Entregador;
use App\Models\Cliente;
use App\Models\Solicitacao;
use App\Models\Entrega;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DelivererApiTest extends TestCase
{
    use RefreshDatabase;

    private $delivererUser;
    private $clientUser;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        $this->delivererUser = Usuario::where('email', 'entregador@deliveryapp.com')->first();
        $this->clientUser = Usuario::where('email', 'cliente@deliveryapp.com')->first();
    }

    protected function createClientRequest(): int
    {
        // Use actingAs to ensure proper authentication context
        $response = $this->actingAs($this->clientUser)
            ->postJson('/api/v1/client/requests', [
                'item' => ['type' => 'Test Package'],
                'pickup_location' => ['latitude' => -23.55, 'longitude' => -46.63],
                'dropoff_location' => ['latitude' => -23.56, 'longitude' => -46.65],
            ]);

        $response->assertStatus(201);
        return $response->json('request.idsolicitacao');
    }

    public function test_deliverer_can_get_profile(): void
    {
        $response = $this->actingAs($this->delivererUser)
            ->getJson('/api/v1/deliverer/profile');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'profile' => ['identregador', 'status'],
                'user',
            ]);
    }

    public function test_deliverer_can_toggle_status(): void
    {
        // Go online
        $response = $this->actingAs($this->delivererUser)
            ->postJson('/api/v1/deliverer/status', ['status' => 'online']);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'status']);

        // Go offline
        $response = $this->actingAs($this->delivererUser)
            ->postJson('/api/v1/deliverer/status', ['status' => 'offline']);

        $response->assertStatus(200);
    }

    public function test_deliverer_can_view_available_requests(): void
    {
        // First go online
        $onlineResponse = $this->actingAs($this->delivererUser)
            ->postJson('/api/v1/deliverer/status', ['status' => 'online']);
        $onlineResponse->assertStatus(200);

        // Create a request as client
        $this->createClientRequest();

        // Now check available requests (need to re-authenticate as deliverer)
        $response = $this->actingAs($this->delivererUser)
            ->getJson('/api/v1/deliverer/available-requests');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'requests',
            ]);
    }

    public function test_deliverer_can_accept_request(): void
    {
        $requestId = $this->createClientRequest();

        // Go online (need to re-auth as deliverer after createClientRequest)
        $this->actingAs($this->delivererUser)
            ->postJson('/api/v1/deliverer/status', ['status' => 'online']);

        $response = $this->actingAs($this->delivererUser)
            ->postJson("/api/v1/deliverer/requests/{$requestId}/accept");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'delivery',
            ]);

        // Verify deliverer status changed to busy
        $deliverer = Entregador::where('usuario_idusuario', $this->delivererUser->idusuario)->first();
        $this->assertEquals('busy', $deliverer->status);
    }

    public function test_deliverer_cannot_accept_without_motorcycle(): void
    {
        // Create a new deliverer without motorcycle
        $newDelivererUser = Usuario::create([
            'name' => 'New Deliverer',
            'email' => 'newdeliverer@test.com',
            'password' => bcrypt('password'),
            'role' => 'entregador',
        ]);
        Entregador::create([
            'usuario_idusuario' => $newDelivererUser->idusuario,
            'status' => 'online',
        ]);

        $requestId = $this->createClientRequest();

        $response = $this->actingAs($newDelivererUser)
            ->postJson("/api/v1/deliverer/requests/{$requestId}/accept");

        // Should fail because deliverer has no motorcycle
        $response->assertStatus(400)
            ->assertJson(['message' => 'You must register a motorcycle first.']);
    }

    public function test_deliverer_can_update_location(): void
    {
        // Go online first
        $this->actingAs($this->delivererUser)
            ->postJson('/api/v1/deliverer/status', ['status' => 'online']);

        $response = $this->actingAs($this->delivererUser)
            ->postJson('/api/v1/deliverer/location', [
                'latitude' => -23.55,
                'longitude' => -46.63,
            ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message']);

        // Verify location was saved
        $deliverer = Entregador::where('usuario_idusuario', $this->delivererUser->idusuario)->first();
        $this->assertNotNull($deliverer->currentLocation);
    }

    public function test_deliverer_can_get_current_delivery(): void
    {
        $requestId = $this->createClientRequest();

        // Accept request (need to re-auth as deliverer after createClientRequest)
        $this->actingAs($this->delivererUser)
            ->postJson('/api/v1/deliverer/status', ['status' => 'online']);

        $this->actingAs($this->delivererUser)
            ->postJson("/api/v1/deliverer/requests/{$requestId}/accept");

        $response = $this->actingAs($this->delivererUser)
            ->getJson('/api/v1/deliverer/deliveries/current');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'delivery',
            ]);
    }

    public function test_deliverer_can_register_motorcycle(): void
    {
        // Create a new deliverer without motorcycle
        $newDelivererUser = Usuario::create([
            'name' => 'Deliverer Without Moto',
            'email' => 'nomoto@test.com',
            'password' => bcrypt('password'),
            'role' => 'entregador',
        ]);
        Entregador::create([
            'usuario_idusuario' => $newDelivererUser->idusuario,
            'status' => 'offline',
        ]);

        $response = $this->actingAs($newDelivererUser)
            ->postJson('/api/v1/deliverer/moto', [
                'plate' => 'ABC1D23',
                'model' => 'Honda CG 160',
                'color' => 'Vermelha',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'moto',
            ]);
    }

    public function test_deliverer_cannot_register_duplicate_motorcycle(): void
    {
        // The seeded deliverer already has a motorcycle
        $response = $this->actingAs($this->delivererUser)
            ->postJson('/api/v1/deliverer/moto', [
                'plate' => 'XYZ9999',
                'model' => 'Yamaha',
                'color' => 'Blue',
            ]);

        $response->assertStatus(400)
            ->assertJson(['message' => 'You already have a registered motorcycle. Use PUT to update.']);
    }

    public function test_motorcycle_plate_validation(): void
    {
        // Create a new deliverer without motorcycle
        $newDelivererUser = Usuario::create([
            'name' => 'Deliverer For Validation',
            'email' => 'validation@test.com',
            'password' => bcrypt('password'),
            'role' => 'entregador',
        ]);
        Entregador::create([
            'usuario_idusuario' => $newDelivererUser->idusuario,
            'status' => 'offline',
        ]);

        // Empty plate (required field)
        $response = $this->actingAs($newDelivererUser)
            ->postJson('/api/v1/deliverer/moto', [
                'plate' => '',
                'model' => 'Honda CG 160',
                'color' => 'Vermelha',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['plate']);
    }

    public function test_location_validation(): void
    {
        // Invalid coordinates
        $response = $this->actingAs($this->delivererUser)
            ->postJson('/api/v1/deliverer/location', [
                'latitude' => 200, // Invalid
                'longitude' => -46.63,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['latitude']);
    }
}
