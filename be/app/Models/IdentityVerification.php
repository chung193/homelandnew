<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class IdentityVerification extends Model {
    protected $fillable=['user_id','verification_type','identity_front_path','identity_back_path','supporting_document_path','tax_code','status','rejection_reason','reviewed_by','reviewed_at'];
    protected $casts=['reviewed_at'=>'datetime'];
    public function user():BelongsTo{return $this->belongsTo(User::class);}
    public function accountType():BelongsTo{return $this->belongsTo(AccountType::class,'verification_type','code');}
}
