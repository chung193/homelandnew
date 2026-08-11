<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up():void { Schema::table('properties',function(Blueprint $table){$table->unsignedInteger('long_term_months')->nullable()->after('price_unit');$table->decimal('long_term_price',12,2)->nullable()->after('long_term_months');$table->decimal('deposit_amount',12,2)->nullable()->after('long_term_price');}); Schema::table('bookings',function(Blueprint $table){$table->unsignedInteger('billing_units')->default(1)->after('nights');$table->string('billing_unit')->default('night')->after('billing_units');$table->string('pricing_tier')->default('standard')->after('billing_unit');$table->decimal('deposit_amount',12,2)->default(0)->after('total_price');$table->decimal('payable_total',12,2)->default(0)->after('deposit_amount');}); }
 public function down():void {Schema::table('bookings',fn(Blueprint $table)=>$table->dropColumn(['billing_units','billing_unit','pricing_tier','deposit_amount','payable_total']));Schema::table('properties',fn(Blueprint $table)=>$table->dropColumn(['long_term_months','long_term_price','deposit_amount']));}
};
