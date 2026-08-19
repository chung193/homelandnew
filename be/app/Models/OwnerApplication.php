<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
class OwnerApplication extends Model {
    protected $fillable = ['user_id','owner_type','tax_code','company_name','company_address','legal_representative','status','identity_front_path','identity_back_path','ownership_document_path','note','rejection_reason','reviewed_by','reviewed_at'];
    protected $casts = ['reviewed_at' => 'datetime'];
    public function user(): BelongsTo { return $this->belongsTo(User::class); }
}
