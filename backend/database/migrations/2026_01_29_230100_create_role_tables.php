<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('root', function (Blueprint $table) {
            $table->id('idroot');
            $table->unsignedBigInteger('usuario_idusuario')->unique();
            $table->foreign('usuario_idusuario')->references('idusuario')->on('usuario')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('cliente', function (Blueprint $table) {
            $table->id('idcliente');
            $table->unsignedBigInteger('usuario_idusuario')->unique();
            $table->enum('status', ['active', 'blocked'])->default('active');
            $table->foreign('usuario_idusuario')->references('idusuario')->on('usuario')->onDelete('cascade');
            $table->timestamps();
        });

        Schema::create('entregador', function (Blueprint $table) {
            $table->id('identregador');
            $table->unsignedBigInteger('usuario_idusuario')->unique();
            $table->enum('status', ['offline', 'online', 'busy'])->default('offline');
            $table->unsignedBigInteger('current_location_id')->nullable();
            $table->foreign('usuario_idusuario')->references('idusuario')->on('usuario')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entregador');
        Schema::dropIfExists('cliente');
        Schema::dropIfExists('root');
    }
};
