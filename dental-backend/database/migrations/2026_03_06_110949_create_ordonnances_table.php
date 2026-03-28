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
    Schema::create('ordonnances', function (Blueprint $table) {
    $table->id();
    $table->date('date_ordonnance');
    $table->text('medicaments');
    $table->text('instructions')->nullable();

    $table->foreignId('consultation_id')->constrained()->cascadeOnDelete();

    $table->timestamps();
});
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ordonnances');
    }
};
