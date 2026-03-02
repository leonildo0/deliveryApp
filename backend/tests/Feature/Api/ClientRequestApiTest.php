<?php

namespace Tests\Feature\Api;

use App\Models\Usuario;
use App\Models\Cliente;
use App\Models\Solicitacao;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ClientRequestApiTest extends TestCase
{
    use RefreshDatabase;

    private $clientUser;
    private $clientToken;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);

        $this->clientUser = Usuario::where('email', 'cliente@deliveryapp.com')->first();
        $this->clientToken = $this->clientUser->createToken('test')->plainTextToken;
    }

    protected function authHeaders(): array
    {
        return ['Authorization' => "Bearer {$this->clientToken}"];
    }

    public function test_client_can_create_request(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/v1/client/requests', [
                'item' => [
                    'type' => 'Documento',
                    'weight_kg' => 0.5,
                    'notes' => 'Frágil',
                ],
                'pickup_location' => [
                    'latitude' => -23.550520,
                    'longitude' => -46.633308,
                ],
                'dropoff_location' => [
                    'latitude' => -23.561414,
                    'longitude' => -46.656166,
                ],
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'request' => [
                    'idsolicitacao',
                    'status',
                    'checkin_code',
                ],
            ]);

        // Verify checkin_code is 6 characters
        $checkinCode = $response->json('request.checkin_code');
        $this->assertEquals(6, strlen($checkinCode));
    }

    public function test_client_cannot_create_second_active_request(): void
    {
        // Create first request
        $this->withHeaders($this->authHeaders())
            ->postJson('/api/v1/client/requests', [
                'item' => ['type' => 'Primeiro item'],
                'pickup_location' => ['latitude' => -23.55, 'longitude' => -46.63],
                'dropoff_location' => ['latitude' => -23.56, 'longitude' => -46.65],
            ]);

        // Try to create second request
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/v1/client/requests', [
                'item' => ['type' => 'Segundo item'],
                'pickup_location' => ['latitude' => -23.55, 'longitude' => -46.63],
                'dropoff_location' => ['latitude' => -23.57, 'longitude' => -46.66],
            ]);

        $response->assertStatus(400)
            ->assertJsonStructure(['message']);
    }

    public function test_client_can_view_their_requests(): void
    {
        // Create a request first
        $this->withHeaders($this->authHeaders())
            ->postJson('/api/v1/client/requests', [
                'item' => ['type' => 'Test item'],
                'pickup_location' => ['latitude' => -23.55, 'longitude' => -46.63],
                'dropoff_location' => ['latitude' => -23.56, 'longitude' => -46.65],
            ]);

        $response = $this->withHeaders($this->authHeaders())
            ->getJson('/api/v1/client/requests');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'requests',
            ]);
    }

    public function test_client_can_view_single_request(): void
    {
        // Create a request
        $createResponse = $this->withHeaders($this->authHeaders())
            ->postJson('/api/v1/client/requests', [
                'item' => ['type' => 'Test item'],
                'pickup_location' => ['latitude' => -23.55, 'longitude' => -46.63],
                'dropoff_location' => ['latitude' => -23.56, 'longitude' => -46.65],
            ]);

        $requestId = $createResponse->json('request.idsolicitacao');

        $response = $this->withHeaders($this->authHeaders())
            ->getJson("/api/v1/client/requests/{$requestId}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'request' => [
                    'idsolicitacao',
                    'status',
                    'checkin_code',
                ],
            ]);
    }

    public function test_client_can_cancel_pending_request(): void
    {
        // Create a request
        $createResponse = $this->withHeaders($this->authHeaders())
            ->postJson('/api/v1/client/requests', [
                'item' => ['type' => 'Test item'],
                'pickup_location' => ['latitude' => -23.55, 'longitude' => -46.63],
                'dropoff_location' => ['latitude' => -23.56, 'longitude' => -46.65],
            ]);

        $requestId = $createResponse->json('request.idsolicitacao');

        $response = $this->withHeaders($this->authHeaders())
            ->postJson("/api/v1/client/requests/{$requestId}/cancel");

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'request']);
        
        // Verify status is canceled
        $this->assertEquals('canceled', $response->json('request.status'));
    }

    public function test_request_validation_requires_item_type(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/v1/client/requests', [
                'item' => ['weight_kg' => 1.0], // missing type
                'pickup_location' => ['latitude' => -23.55, 'longitude' => -46.63],
                'dropoff_location' => ['latitude' => -23.56, 'longitude' => -46.65],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['item.type']);
    }

    public function test_request_validation_requires_valid_coordinates(): void
    {
        $response = $this->withHeaders($this->authHeaders())
            ->postJson('/api/v1/client/requests', [
                'item' => ['type' => 'Test'],
                'pickup_location' => ['latitude' => 200, 'longitude' => -46.63], // invalid lat
                'dropoff_location' => ['latitude' => -23.56, 'longitude' => -46.65],
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['pickup_location.latitude']);
    }
}
