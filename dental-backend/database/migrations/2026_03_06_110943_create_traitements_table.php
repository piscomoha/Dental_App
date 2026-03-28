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
    Schema::create('traitements', function (Blueprint $table) {
    $table->id();
    $table->string('nom_traitement');
    $table->text('description')->nullable();
    $table->decimal('prix', 8, 2);

    $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('traitements');
    }
};
