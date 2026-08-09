<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->bigIncrements('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->longText('content');
            $table->foreignId('category_id')->nullable()->constrained('categories');
            $table->foreignId('user_id')->constrained('users');
            $table->enum('status', ['draft', 'published', 'pending', 'archived'])->default('draft');
            $table->enum('type', ['article', 'news', 'tutorial', 'review', 'story'])->default('article');
            $table->integer('views')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->boolean('featured')->default(false);
            $table->boolean('allow_comments')->default(true);
            $table->softDeletes();

            $table->index('status');
            $table->index('published_at');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
