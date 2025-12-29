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
        Schema::create('deals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('client_name');
            $table->enum('stage', ['new', 'call', 'in-progress', 'meeting', 'deal-lost', 'close-deal'])->default('new');
            $table->decimal('value', 10, 2)->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Indexes for searching and filtering
            $table->index(['user_id', 'stage']);
            $table->index(['user_id', 'created_at']);
            $table->index('client_name');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deals');
    }
};
