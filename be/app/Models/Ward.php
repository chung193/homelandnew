<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ward extends Model
{
    use HasFactory;

    protected $table = 'wards';

    protected $fillable = [
        'province_code',
        'district_code',
        'code',
        'name',
        'name_en',
        'full_name',
        'full_name_en',
        'division_type',
        'codename',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'province_code' => 'integer',
        'district_code' => 'integer',
        'code' => 'integer',
    ];

    public function district(): BelongsTo
    {
        return $this->belongsTo(District::class, 'district_code', 'code');
    }

    public function province(): BelongsTo
    {
        return $this->belongsTo(Province::class, 'province_code', 'code');
    }
}
