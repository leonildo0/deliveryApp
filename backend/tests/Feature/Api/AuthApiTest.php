<?php

namespace Tests\Feature\Api;

use App\Models\Usuario;
use App\Models\Cliente;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(\Database\Seeders\DatabaseSeeder::class);
    }

    public function test_client_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Novo Cliente',
            'email' => 'novocliente@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'cliente',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['idusuario', 'name', 'email', 'role'],
                'token',
            ]);

        $this->assertDatabaseHas('usuario', [
            'email' => 'novocliente@example.com',
            'role' => 'cliente',
        ]);

        $this->assertDatabaseHas('cliente', [
            'status' => 'active',
        ]);
    }

    public function test_deliverer_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Novo Entregador',
            'email' => 'novoentregador@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'entregador',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'user', 'token']);

        $this->assertDatabaseHas('entregador', [
            'status' => 'offline',
        ]);
    }

    public function test_registration_validates_email_uniqueness(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Duplicate User',
            'email' => 'cliente@deliveryapp.com', // Already exists from seeder
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'role' => 'cliente',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_registration_validates_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'different_password',
            'role' => 'cliente',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['password']);
    }

    public function test_client_can_login(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'cliente@deliveryapp.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user',
                'token',
            ]);
    }

    public function test_deliverer_can_login(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'entregador@deliveryapp.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['message', 'user', 'token']);
    }

    public function test_login_fails_with_wrong_credentials(): void
    {
        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'cliente@deliveryapp.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(422);
    }

    public function test_authenticated_user_can_get_profile(): void
    {
        $usuario = Usuario::where('email', 'cliente@deliveryapp.com')->first();
        $token = $usuario->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->getJson('/api/v1/auth/me');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['idusuario', 'name', 'email', 'role'],
            ]);
    }

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401);
    }

    public function test_user_can_logout(): void
    {
        $usuario = Usuario::where('email', 'cliente@deliveryapp.com')->first();
        $token = $usuario->createToken('test')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)
            ->assertJsonStructure(['message']);
    }
}
