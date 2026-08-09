<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class UserDetail extends Model
{
    use HasFactory;
    protected $table = 'user_details';
    protected $primaryKey = 'id';
    public $timestamps = true;
    public $incrementing = false;
    protected $keyType = 'string';
    protected $fillable = [
        'address',
        'city',
        'user_id',
        'description',
        'birthday',
        'position',
        'website',
        'github',
        'join_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
