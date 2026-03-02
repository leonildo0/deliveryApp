<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('delivery_share', function (Blueprint $table) {
            $table->id('iddelivery_share');
            $table->unsignedBigInteger('solicitacao_id')->unique();
            $table->string('share_token', 64)->unique();
            $table->string('checkout_code', 6);
            $table->boolean('checkout_code_visible')->default(false);
            $table->timestamp('expires_at')->nullable();
            $table->foreign('solicitacao_id')->references('idsolicitacao')->on('solicitacao')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('delivery_share');
    }
};
