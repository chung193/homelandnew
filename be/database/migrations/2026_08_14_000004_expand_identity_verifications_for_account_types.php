<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::table('identity_verifications', function (Blueprint $table) {
        $table->string('verification_type')->default('individual')->after('user_id');
        $table->string('identity_front_path')->nullable()->change();
        $table->string('identity_back_path')->nullable()->change();
        $table->string('supporting_document_path')->nullable()->after('identity_back_path');
        $table->string('tax_code', 50)->nullable()->after('supporting_document_path');
    }); }
    public function down(): void { Schema::table('identity_verifications', function (Blueprint $table) {
        $table->dropColumn(['verification_type','supporting_document_path','tax_code']);
        $table->string('identity_front_path')->nullable(false)->change();
        $table->string('identity_back_path')->nullable(false)->change();
    }); }
};
