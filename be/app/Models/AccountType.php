<?php
namespace App\Models;use Illuminate\Database\Eloquent\Model;
class AccountType extends Model{protected $fillable=['code','name','description','document_kind','document_label','requires_back_side','requires_tax_code','is_active','sort_order'];protected $casts=['requires_back_side'=>'boolean','requires_tax_code'=>'boolean','is_active'=>'boolean','sort_order'=>'integer'];}
