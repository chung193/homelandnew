<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
    public function up(): void { Schema::table('owner_applications', function (Blueprint $table) { $table->string('owner_type')->nullable()->after('user_id'); $table->string('tax_code', 50)->nullable()->after('owner_type'); }); }
    public function down(): void { Schema::table('owner_applications', fn (Blueprint $table) => $table->dropColumn(['owner_type', 'tax_code'])); }
};
