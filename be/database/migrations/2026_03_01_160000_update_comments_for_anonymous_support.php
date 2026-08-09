<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('comments', function (Blueprint $table) {
            if (!Schema::hasColumn('comments', 'guest_name')) {
                $table->string('guest_name', 120)->nullable()->after('user_id');
            }

            if (!Schema::hasColumn('comments', 'guest_email')) {
                $table->string('guest_email')->nullable()->after('guest_name');
            }
        });

        DB::statement('ALTER TABLE comments DROP FOREIGN KEY comments_user_id_foreign');
        DB::statement('ALTER TABLE comments MODIFY user_id BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE comments ADD CONSTRAINT comments_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE comments DROP FOREIGN KEY comments_user_id_foreign');
        DB::statement('ALTER TABLE comments MODIFY user_id BIGINT UNSIGNED NOT NULL');
        DB::statement('ALTER TABLE comments ADD CONSTRAINT comments_user_id_foreign FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE');

        Schema::table('comments', function (Blueprint $table) {
            if (Schema::hasColumn('comments', 'guest_email')) {
                $table->dropColumn('guest_email');
            }

            if (Schema::hasColumn('comments', 'guest_name')) {
                $table->dropColumn('guest_name');
            }
        });
    }
};
