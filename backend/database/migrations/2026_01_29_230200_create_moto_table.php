<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('moto', function (Blueprint $table) {
            $table->id('idmoto');
            $table->unsignedBigInteger('entregador_id')->unique();
            $table->string('plate');
            $table->string('model')->nullable();
            $table->string('color')->nullable();
            $table->foreign('entregador_id')->references('identregador')->on('entregador')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('moto');
    }
};
