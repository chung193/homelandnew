<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('owner_applications', function (Blueprint $table) {
            $table->string('company_name')->nullable()->after('tax_code');
            $table->string('company_address')->nullable()->after('company_name');
            $table->string('legal_representative')->nullable()->after('company_address');
        });
    }

    public function down(): void
    {
        Schema::table('owner_applications', fn (Blueprint $table) => $table->dropColumn(['company_name', 'company_address', 'legal_representative']));
    }
};
