<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class BookingStatusHistory extends Model { protected $fillable=['booking_id','changed_by','from_status','to_status','note']; }
