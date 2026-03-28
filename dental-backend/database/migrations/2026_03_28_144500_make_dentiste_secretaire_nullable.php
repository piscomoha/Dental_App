<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('rendez_vouses', function (Blueprint $table) {
            // Make dentiste_id and secretaire_id nullable
            $table->unsignedBigInteger('dentiste_id')->nullable()->change();
            $table->unsignedBigInteger('secretaire_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('rendez_vouses', function (Blueprint $table) {
            // Revert to non-nullable
            $table->unsignedBigInteger('dentiste_id')->nullable(false)->change();
            $table->unsignedBigInteger('secretaire_id')->nullable(false)->change();
        });
    }
};
