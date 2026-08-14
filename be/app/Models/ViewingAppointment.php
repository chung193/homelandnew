<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ViewingAppointment extends Model
{
    use HasFactory;

    protected $fillable = [
        'property_id', 'viewer_id', 'appointment_date', 'start_time', 'end_time',
        'note', 'status', 'responded_at',
    ];

    protected $casts = [
        'appointment_date' => 'date',
        'responded_at' => 'datetime',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    public function viewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'viewer_id');
    }
}
