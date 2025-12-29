<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Deal extends Model
{
    protected $fillable = [
        'user_id',
        'assigned_to',
        'client_name',
        'phone_number',
        'stage',
        'priority',
        'value',
        'notes',
    ];

    protected $casts = [
        'value' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function todos(): HasMany
    {
        return $this->hasMany(DealTodo::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(DealComment::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(DealMessage::class);
    }

    // Scopes for filtering
    public function scopeByStage($query, $stage)
    {
        return $query->where('stage', $stage);
    }

    public function scopeActive($query)
    {
        return $query->whereNotIn('stage', ['deal-lost', 'close-deal']);
    }
}
