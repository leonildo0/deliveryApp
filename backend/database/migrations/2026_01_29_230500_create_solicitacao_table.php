<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('solicitacao', function (Blueprint $table) {
            $table->id('idsolicitacao');
            $table->unsignedBigInteger('cliente_id');
            $table->enum('status', ['requested', 'accepted', 'canceled', 'expired', 'fulfilled'])->default('requested');
            $table->unsignedBigInteger('item_id');
            $table->unsignedBigInteger('pickup_location_id');
            $table->unsignedBigInteger('dropoff_location_id');
            $table->string('checkin_code', 6);
            $table->foreign('cliente_id')->references('idcliente')->on('cliente')->onDelete('cascade');
            $table->foreign('item_id')->references('iditem')->on('item')->onDelete('cascade');
            $table->foreign('pickup_location_id')->references('idlocation')->on('location');
            $table->foreign('dropoff_location_id')->references('idlocation')->on('location');
            $table->index('status', 'ix_solicitacao_status');
            $table->timestamps();
        });

        // Partial unique index for one active request per client (SQLite compatible)
        DB::statement('CREATE UNIQUE INDEX uq_active_request_per_client ON solicitacao (cliente_id) WHERE status IN (\'requested\', \'accepted\')');
    }

    public function down(): void
    {
        Schema::dropIfExists('solicitacao');
    }
};
