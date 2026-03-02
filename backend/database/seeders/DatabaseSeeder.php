<?php

namespace Database\Seeders;

use App\Models\Usuario;
use App\Models\Root;
use App\Models\Cliente;
use App\Models\Entregador;
use App\Models\Moto;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create root user
        $rootUser = Usuario::create([
            'name' => 'Admin Root',
            'email' => 'root@deliveryapp.com',
            'password' => Hash::make('password123'),
            'role' => 'root',
        ]);
        Root::create(['usuario_idusuario' => $rootUser->idusuario]);

        // Create test cliente
        $clienteUser = Usuario::create([
            'name' => 'João Cliente',
            'email' => 'cliente@deliveryapp.com',
            'password' => Hash::make('password123'),
            'role' => 'cliente',
        ]);
        Cliente::create([
            'usuario_idusuario' => $clienteUser->idusuario,
            'status' => 'active',
        ]);

        // Create test entregador
        $entregadorUser = Usuario::create([
            'name' => 'Carlos Entregador',
            'email' => 'entregador@deliveryapp.com',
            'password' => Hash::make('password123'),
            'role' => 'entregador',
        ]);
        $entregador = Entregador::create([
            'usuario_idusuario' => $entregadorUser->idusuario,
            'status' => 'offline',
        ]);

        // Add moto for entregador
        Moto::create([
            'entregador_id' => $entregador->identregador,
            'plate' => 'ABC-1234',
            'model' => 'Honda CG 160',
            'color' => 'Vermelha',
        ]);

        $this->command->info('Seed completed!');
        $this->command->info('Root: root@deliveryapp.com / password123');
        $this->command->info('Cliente: cliente@deliveryapp.com / password123');
        $this->command->info('Entregador: entregador@deliveryapp.com / password123');
    }
}
