<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Booking extends Model
{
    use HasFactory;

    protected $table = 'bookings';

    protected $fillable = [
        'property_id',
        'customer_id',
        'start_date',
        'end_date',
        'nights',
        'billing_units', 'billing_unit', 'pricing_tier',
        'unit_price',
        'total_price',
        'deposit_amount', 'payable_total',
        'status',
        'note',
        'confirmed_at', 'started_at', 'completed_at', 'cancelled_at',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'billing_units' => 'integer', 'deposit_amount' => 'decimal:2', 'payable_total' => 'decimal:2',
        'confirmed_at' => 'datetime', 'started_at' => 'datetime', 'completed_at' => 'datetime', 'cancelled_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'customer_id');
    }
}
