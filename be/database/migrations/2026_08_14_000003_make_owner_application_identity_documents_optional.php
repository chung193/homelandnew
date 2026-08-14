<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::table('owner_applications', function (Blueprint $table) {
        $table->string('identity_front_path')->nullable()->change();
    }); }
    public function down(): void { Schema::table('owner_applications', function (Blueprint $table) {
        $table->string('identity_front_path')->nullable(false)->change();
    }); }
};
