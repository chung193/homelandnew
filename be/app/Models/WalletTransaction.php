<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class WalletTransaction extends Model {
    protected $fillable = ['user_id','type','amount','balance_after','status','provider','order_id','request_id','provider_transaction_id','metadata','paid_at'];
    protected $casts = ['amount'=>'integer','balance_after'=>'integer','metadata'=>'array','paid_at'=>'datetime'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
