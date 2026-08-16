<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('viewing_appointments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained('properties')->cascadeOnDelete();
            $table->foreignId('viewer_id')->constrained('users')->cascadeOnDelete();
            $table->date('appointment_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->text('note')->nullable();
            $table->string('status')->default('pending');
            $table->timestamp('responded_at')->nullable();
            $table->timestamps();

            $table->index(['property_id', 'appointment_date', 'status'], 'viewing_property_date_status_index');
            $table->index(['viewer_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('viewing_appointments');
    }
};
