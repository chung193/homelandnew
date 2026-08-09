<?php

use App\Models\Comment;
use App\Models\Post;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

it('stores guest comments as pending and excludes them from approved comments list', function () {
    $author = User::factory()->create();
    $post = Post::factory()->for($author)->create([
        'allow_comments' => true,
        'status' => 'published',
    ]);

    $response = $this->postJson("/api/v1/client/post/{$post->slug}/comments", [
        'body' => 'Guest comment awaiting approval',
        'guest_name' => 'Guest User',
        'guest_email' => 'guest@example.com',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.message', 'Comment submitted successfully and is awaiting approval')
        ->assertJsonPath('data.comment.is_approved', false)
        ->assertJsonPath('data.comment.guest_name', 'Guest User');

    $commentId = $response->json('data.comment.id');

    $comment = Comment::query()->find($commentId);

    expect($comment)->not->toBeNull();
    expect($comment?->user_id)->toBeNull();

    $this->getJson("/api/v1/client/post/{$post->slug}/comments")
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('stores authenticated non-admin comments as pending until approved', function () {
    $author = User::factory()->create();
    $commenter = User::factory()->create();
    $post = Post::factory()->for($author)->create([
        'allow_comments' => true,
        'status' => 'published',
    ]);

    $response = $this->actingAs($commenter)->postJson("/api/v1/client/post/{$post->slug}/comments", [
        'body' => 'Signed in comment awaiting approval',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.message', 'Comment submitted successfully and is awaiting approval')
        ->assertJsonPath('data.comment.is_approved', false)
        ->assertJsonPath('data.comment.user_id', $commenter->id);

    $this->getJson("/api/v1/client/post/{$post->slug}/comments")
        ->assertOk()
        ->assertJsonCount(0, 'data');
});

it('auto approves authenticated admin comments and returns them in the approved comments list', function () {
    $author = User::factory()->create();
    $admin = User::factory()->create();
    Role::query()->firstOrCreate(['name' => 'admin', 'guard_name' => 'api']);
    $admin->assignRole('admin');

    $post = Post::factory()->for($author)->create([
        'allow_comments' => true,
        'status' => 'published',
    ]);

    $response = $this->actingAs($admin)->postJson("/api/v1/client/post/{$post->slug}/comments", [
        'body' => 'Admin comment',
    ]);

    $response
        ->assertCreated()
        ->assertJsonPath('data.message', 'Comment created successfully')
        ->assertJsonPath('data.comment.is_approved', true)
        ->assertJsonPath('data.comment.user_id', $admin->id);

    $this->getJson("/api/v1/client/post/{$post->slug}/comments")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.body', 'Admin comment')
        ->assertJsonPath('data.0.user_id', $admin->id);
});

it('lists only comments that belong to the authenticated authors posts in moderation view', function () {
    $author = User::factory()->create();
    $otherAuthor = User::factory()->create();

    $ownedPost = Post::factory()->for($author)->create([
        'allow_comments' => true,
        'status' => 'published',
    ]);
    $otherPost = Post::factory()->for($otherAuthor)->create([
        'allow_comments' => true,
        'status' => 'published',
    ]);

    Comment::query()->create([
        'body' => 'Owned pending comment',
        'guest_name' => 'Owned Guest',
        'guest_email' => 'owned@example.com',
        'user_id' => null,
        'commentable_id' => $ownedPost->id,
        'commentable_type' => Post::class,
        'parent_id' => null,
        'is_approved' => false,
    ]);

    Comment::query()->create([
        'body' => 'Foreign pending comment',
        'guest_name' => 'Foreign Guest',
        'guest_email' => 'foreign@example.com',
        'user_id' => null,
        'commentable_id' => $otherPost->id,
        'commentable_type' => Post::class,
        'parent_id' => null,
        'is_approved' => false,
    ]);

    $this->actingAs($author, 'api')
        ->getJson('/api/v1/comment?status=pending')
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.author_name', 'Owned Guest')
        ->assertJsonPath('data.0.post.id', $ownedPost->id);
});

it('allows the post owner to approve pending comments from moderation view', function () {
    $author = User::factory()->create();
    $post = Post::factory()->for($author)->create([
        'allow_comments' => true,
        'status' => 'published',
    ]);

    $comment = Comment::query()->create([
        'body' => 'Needs approval',
        'guest_name' => 'Needs approval',
        'guest_email' => 'pending@example.com',
        'user_id' => null,
        'commentable_id' => $post->id,
        'commentable_type' => Post::class,
        'parent_id' => null,
        'is_approved' => false,
    ]);

    $this->actingAs($author, 'api')
        ->patchJson("/api/v1/comment/{$comment->id}/approve")
        ->assertOk()
        ->assertJsonPath('data.comment.is_approved', true);

    expect($comment->fresh()->is_approved)->toBeTrue();
});


it('still lists approved comments for posts that have comments disabled but blocks new submissions', function () {
    $author = User::factory()->create();
    $post = Post::factory()->for($author)->create([
        'allow_comments' => false,
        'status' => 'published',
    ]);

    Comment::query()->create([
        'body' => 'Previously approved comment',
        'guest_name' => 'Old Guest',
        'guest_email' => 'old@example.com',
        'user_id' => null,
        'commentable_id' => $post->id,
        'commentable_type' => Post::class,
        'parent_id' => null,
        'is_approved' => true,
    ]);

    $this->getJson("/api/v1/client/post/{$post->slug}/comments")
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.body', 'Previously approved comment');

    $this->postJson("/api/v1/client/post/{$post->slug}/comments", [
        'body' => 'Should be blocked',
        'guest_name' => 'Blocked Guest',
    ])
        ->assertStatus(422);
});
