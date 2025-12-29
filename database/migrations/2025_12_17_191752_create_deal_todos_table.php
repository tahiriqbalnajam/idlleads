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
        Schema::create('deal_todos', function (Blueprint $table) {
            $table->id();
            $table->foreignId('deal_id')->constrained()->onDelete('cascade');
            $table->text('text');
            $table->boolean('completed')->default(false);
            $table->date('due_date')->nullable();
            $table->integer('priority')->default(0);
            $table->timestamps();
            
            // Indexes for dashboard queries (today, tomorrow, overdue)
            $table->index(['deal_id', 'completed']);
            $table->index(['due_date', 'completed']);
            $table->index(['completed', 'due_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deal_todos');
    }
};
