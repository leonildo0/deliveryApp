<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('entrega', function (Blueprint $table) {
            $table->id('identrega');
            $table->unsignedBigInteger('entregador_id');
            $table->unsignedBigInteger('solicitacao_id')->unique();
            $table->enum('status', ['checkin_pending', 'in_progress', 'completed', 'canceled'])->default('checkin_pending');
            $table->timestamp('checkin_at')->nullable();
            $table->timestamp('checkout_at')->nullable();
            $table->foreign('entregador_id')->references('identregador')->on('entregador')->onDelete('cascade');
            $table->foreign('solicitacao_id')->references('idsolicitacao')->on('solicitacao')->onDelete('cascade');
            $table->index('status', 'ix_entrega_status');
            $table->timestamps();
        });

        // Partial unique index for one active delivery per deliverer (SQLite compatible)
        DB::statement('CREATE UNIQUE INDEX uq_active_delivery_per_deliverer ON entrega (entregador_id) WHERE status IN (\'checkin_pending\', \'in_progress\')');
    }

    public function down(): void
    {
        Schema::dropIfExists('entrega');
    }
};
