<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('account_type')->default('customer')->after('registration_source');
            $table->decimal('wallet_balance', 15, 0)->default(0)->after('account_type');
        });
        Schema::create('owner_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('status')->default('pending');
            $table->string('identity_front_path');
            $table->string('identity_back_path')->nullable();
            $table->string('ownership_document_path');
            $table->text('note')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->foreignId('reviewed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
        Schema::create('wallet_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('type');
            $table->decimal('amount', 15, 0);
            $table->decimal('balance_after', 15, 0)->nullable();
            $table->string('status')->default('pending');
            $table->string('provider')->nullable();
            $table->string('order_id')->nullable()->unique();
            $table->string('request_id')->nullable()->unique();
            $table->string('provider_transaction_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();
        });
        Schema::table('properties', function (Blueprint $table) {
            $table->decimal('posting_fee', 15, 0)->default(0);
        });
    }

    public function down(): void
    {
        Schema::table('properties', fn (Blueprint $table) => $table->dropColumn('posting_fee'));
        Schema::dropIfExists('wallet_transactions');
        Schema::dropIfExists('owner_applications');
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn(['account_type', 'wallet_balance']));
    }
};
