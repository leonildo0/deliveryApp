<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('location', function (Blueprint $table) {
            $table->id('idlocation');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->timestamp('recorded_at')->useCurrent();
            $table->enum('source_type', ['deliverer', 'request']);
            $table->timestamps();
        });

        // Add foreign key to entregador after location table exists
        Schema::table('entregador', function (Blueprint $table) {
            $table->foreign('current_location_id')->references('idlocation')->on('location')->onDelete('set null');
        });

        // Add index for location queries
        Schema::table('location', function (Blueprint $table) {
            $table->index('recorded_at', 'ix_location_recorded_at');
        });
    }

    public function down(): void
    {
        Schema::table('entregador', function (Blueprint $table) {
            $table->dropForeign(['current_location_id']);
        });
        Schema::dropIfExists('location');
    }
};
