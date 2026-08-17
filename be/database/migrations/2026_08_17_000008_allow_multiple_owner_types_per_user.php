<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('owner_applications', function (Blueprint $table) {
            $table->dropUnique('owner_applications_user_id_unique');
            $table->unique(['user_id', 'owner_type']);
        });
    }

    public function down(): void
    {
        Schema::table('owner_applications', function (Blueprint $table) {
            $table->dropUnique(['user_id', 'owner_type']);
            $table->unique('user_id');
        });
    }
};
