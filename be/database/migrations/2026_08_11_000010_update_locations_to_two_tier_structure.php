<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('wards', function (Blueprint $table) {
            $table->dropForeign(['district_code']);
        });

        Schema::table('wards', function (Blueprint $table) {
            $table->integer('district_code')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('wards', function (Blueprint $table) {
            $table->integer('district_code')->nullable(false)->change();
            $table->foreign('district_code')->references('code')->on('districts')->cascadeOnDelete();
        });
    }
};
