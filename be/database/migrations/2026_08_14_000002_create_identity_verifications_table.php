<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void { Schema::create('identity_verifications', function (Blueprint $table) {
        $table->id(); $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
        $table->string('identity_front_path'); $table->string('identity_back_path');
        $table->string('status')->default('pending'); $table->text('rejection_reason')->nullable();
        $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete(); $table->timestamp('reviewed_at')->nullable(); $table->timestamps();
    }); }
    public function down(): void { Schema::dropIfExists('identity_verifications'); }
};
