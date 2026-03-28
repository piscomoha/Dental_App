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
        Schema::table('ordonnances', function (Blueprint $table) {
            // Drop existing foreign key and column
            $table->dropForeign(['consultation_id']);
            $table->dropColumn('consultation_id');
        });

        Schema::table('ordonnances', function (Blueprint $table) {
            // Recreate column as nullable and re-add foreign key constraint
            $table->foreignId('consultation_id')->nullable()->constrained()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ordonnances', function (Blueprint $table) {
            // Drop nullable column and recreate as NOT NULL with constraint
            $table->dropForeign(['consultation_id']);
            $table->dropColumn('consultation_id');
        });

        Schema::table('ordonnances', function (Blueprint $table) {
            $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();
        });
    }
};
