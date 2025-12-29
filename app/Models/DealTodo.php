<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Carbon\Carbon;

class DealTodo extends Model
{
    protected $fillable = [
        'deal_id',
        'text',
        'completed',
        'due_date',
        'due_time',
        'priority',
    ];

    protected $casts = [
        'completed' => 'boolean',
        'due_date' => 'date',
    ];

    public function deal(): BelongsTo
    {
        return $this->belongsTo(Deal::class);
    }

    // Scopes for dashboard
    public function scopePending($query)
    {
        return $query->where('completed', false);
    }

    public function scopeDueToday($query)
    {
        return $query->whereDate('due_date', Carbon::today())
            ->where('completed', false);
    }

    public function scopeDueTomorrow($query)
    {
        return $query->whereDate('due_date', Carbon::tomorrow())
            ->where('completed', false);
    }

    public function scopeOverdue($query)
    {
        return $query->where('due_date', '<', Carbon::today())
            ->where('completed', false);
    }
}
