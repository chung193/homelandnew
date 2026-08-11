<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->timestamp('confirmed_at')->nullable()->after('status');
            $table->timestamp('started_at')->nullable()->after('confirmed_at');
            $table->timestamp('completed_at')->nullable()->after('started_at');
            $table->timestamp('cancelled_at')->nullable()->after('completed_at');
        });
        Schema::create('booking_status_histories', function (Blueprint $table) {
            $table->id(); $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('changed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('from_status')->nullable(); $table->string('to_status'); $table->text('note')->nullable(); $table->timestamps();
            $table->index(['booking_id', 'created_at']);
        });
    }
    public function down(): void { Schema::dropIfExists('booking_status_histories'); Schema::table('bookings', fn (Blueprint $table) => $table->dropColumn(['confirmed_at','started_at','completed_at','cancelled_at'])); }
};
