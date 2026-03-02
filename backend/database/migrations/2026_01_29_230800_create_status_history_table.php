<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('status_history', function (Blueprint $table) {
            $table->id('idstatus_history');
            $table->enum('entity_type', ['cliente', 'entregador', 'solicitacao', 'entrega']);
            $table->unsignedBigInteger('entity_id');
            $table->string('old_status')->nullable();
            $table->string('new_status');
            $table->timestamp('changed_at')->useCurrent();
            $table->unsignedBigInteger('changed_by_user_id');
            $table->foreign('changed_by_user_id')->references('idusuario')->on('usuario');
            $table->index(['entity_type', 'entity_id']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('status_history');
    }
};
