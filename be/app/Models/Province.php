<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Province extends Model
{
    use HasFactory;

    protected $table = 'provinces';

    protected $fillable = [
        'code',
        'name',
        'name_en',
        'full_name',
        'full_name_en',
        'division_type',
        'codename',
        'phone_code',
        'order_level',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'order_level' => 'integer',
        'code' => 'integer',
        'phone_code' => 'integer',
    ];

    public function districts(): HasMany
    {
        return $this->hasMany(District::class, 'province_code', 'code');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
