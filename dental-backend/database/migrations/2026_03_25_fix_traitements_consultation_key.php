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
        Schema::table('traitements', function (Blueprint $table) {
            // Drop the foreign key constraint first
            $table->dropForeign(['consultation_id']);
            
            // Make consultation_id nullable and add back the foreign key with onDelete('set null')
            $table->unsignedBigInteger('consultation_id')->nullable()->change();
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('traitements', function (Blueprint $table) {
            // Drop the nullable foreign key
            $table->dropForeign(['consultation_id']);
            
            // Restore original not-null constraint with cascadeOnDelete
            $table->unsignedBigInteger('consultation_id')->change();
            $table->foreign('consultation_id')->references('id')->on('consultations')->onDelete('cascade');
        });
    }
};
