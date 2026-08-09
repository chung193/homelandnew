<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\TagController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\PageController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\PropertyTypeController;
use App\Http\Controllers\Api\V1\AmenityController;
use App\Http\Controllers\Api\V1\StatisticsController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\UploadFileController;
use App\Http\Controllers\Api\V1\LocationController;
use Illuminate\Support\Facades\Route;

// client
use App\Http\Controllers\Api\V1\Client\CategoryController as ClientCategoryController;
use App\Http\Controllers\Api\V1\Client\PostController as ClientPostController;
use App\Http\Controllers\Api\V1\Client\CommentController as ClientCommentController;
use App\Http\Controllers\Api\V1\Client\TagController as ClientTagController;

/*
|--------------------------------------------------------------------------
| API V1 Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for version 1 of your application.
| These routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group with the prefix "api/v1".
|
*/

Route::name('client.')
    ->prefix('client')
    ->group(
        function () {
            Route::apiResource('category', ClientCategoryController::class)->only(['index'])->names('category');
            Route::apiResource('tag', ClientTagController::class)->only(['index'])->names('tag');
            Route::get('post', [ClientPostController::class, 'index'])->name('post.index');
            Route::get('post/{slug}', [ClientPostController::class, 'show'])->name('post.show');
            Route::get('post/{post_slug}/comments', [ClientCommentController::class, 'indexByPost'])->name('post.comments');
            Route::post('post/{post_slug}/comments', [ClientCommentController::class, 'storeByPost'])->name('post.comments.store');
            Route::get('my-comments', [ClientCommentController::class, 'myComments'])->middleware('auth:api')->name('my-comments');
            Route::apiResource('comment', ClientCommentController::class)->only(['store', 'update', 'destroy'])->names('comment');
            Route::patch('comment/{id}/approve', [ClientCommentController::class, 'approve'])->name('comment.approve');
            // Route::group(['middleware' => 'auth:api'], function () {
            //     Route::post('post/{post}/comments', [ClientCommentController::class, 'storeByPost'])->name('post.comments.store');
            //     Route::apiResource('comment', ClientCommentController::class)->only(['store', 'update', 'destroy'])->names('comment');
            //     Route::patch('comment/{id}/approve', [ClientCommentController::class, 'approve'])->name('comment.approve');
            // });
        }
    );

Route::get('/ping', function () {
    return 'V1 OK';
});

Route::prefix('locations')->group(function () {
    Route::get('provinces', [LocationController::class, 'provinces']);
    Route::get('districts', [LocationController::class, 'districts']);
    Route::get('wards', [LocationController::class, 'wards']);
});

// Search routes (public)
Route::get('/search', [SearchController::class, 'global'])->name('search.global');
Route::get('/search/posts', [SearchController::class, 'posts'])->name('search.posts');
Route::get('/search/pages', [SearchController::class, 'pages'])->name('search.pages');
Route::get('/search/users', [SearchController::class, 'users'])->name('search.users');
Route::get('/search/categories', [SearchController::class, 'categories'])->name('search.categories');

Route::name('auth.')
    ->prefix('auth')
    ->group(function () {
        Route::post('register', [AuthController::class, 'register'])->name('register');
        Route::post('login', [AuthController::class, 'login'])->name('login');
        Route::post('forgot', [AuthController::class, 'forgot'])->name('forgot');
        Route::post('reset-password', [AuthController::class, 'reset'])->name('reset');
        Route::get('email/verify/{id}/{hash}', [AuthController::class, 'verify'])->name('verify.email')->middleware('signed');
        Route::post('email/resend', [AuthController::class, 'resend'])->name('resend.verify.email');
        // Protected routes
        Route::group(['middleware' => 'auth:api'], function () {
            Route::get('me', [AuthController::class, 'me'])->name('me');
            Route::put('me', [AuthController::class, 'updateProfile'])->name('me.update');
            Route::patch('change-password', [AuthController::class, 'changePassword'])->name('change-password');
            Route::get('refresh', [AuthController::class, 'refresh'])->name('refresh');
            Route::get('logout', [AuthController::class, 'logout'])->name('logout');
        });
    });

Route::post('/post-import-wordpress-xml', [PostController::class, 'importWordpressXml'])->name('post.import.wordpress_xml');

Route::get('/property-types/all', [PropertyTypeController::class, 'all'])->name('property-types.all');
Route::get('/property-types/active', [PropertyTypeController::class, 'active'])->name('property-types.active');
Route::get('/amenities/all', [AmenityController::class, 'all'])->name('amenities.all');
Route::get('/amenities/active', [AmenityController::class, 'active'])->name('amenities.active');

Route::group(['middleware' => 'auth:api'], function () {
    // Statistics routes
    Route::get('/statistics/dashboard', [StatisticsController::class, 'dashboard'])->name('statistics.dashboard');
    Route::get('/statistics/monthly-trends', [StatisticsController::class, 'monthlyTrends'])->name('statistics.monthly-trends');

    Route::get('users/active', [UserController::class, 'active'])->name('users.active');
    Route::get('users/all', [UserController::class, 'all'])->name('users.all');
    Route::apiResource('user', UserController::class)->names('users');
    Route::delete('users', [UserController::class, 'bulkDestroy'])->name('users.bulk_destroy');
    Route::post('/user/{user}/role', [UserController::class, 'assignRoles'])->name('user.assign_roles');
    Route::post('/user-export', [UserController::class, 'export'])->name('users.export');

    Route::post('/media/upload', [UploadFileController::class, 'upload']);
    Route::apiResource('media', MediaController::class)->only(['index', 'store', 'update', 'destroy'])->names('media');
    Route::delete('medias', [MediaController::class, 'bulkDestroy'])->name('media.bulk_destroy');

    Route::apiResource('category', CategoryController::class)->names('category');
    Route::post('/category-export', [CategoryController::class, 'export'])->name('category.export');
    Route::delete('categories', [CategoryController::class, 'bulkDestroy'])->name('categories.bulk_destroy');

    Route::apiResource('tag', TagController::class)->names('tag');
    Route::post('/tag-export', [TagController::class, 'export'])->name('tag.export');
    Route::delete('tags', [TagController::class, 'bulkDestroy'])->name('tags.bulk_destroy');

    Route::apiResource('post', PostController::class)->names('post');
    Route::post('/post-export', [PostController::class, 'export'])->name('post.export');

    Route::get('/post-count', [PostController::class, 'postCount'])->name('post.count');
    Route::delete('posts', [PostController::class, 'bulkDestroy'])->name('post.bulk_destroy');

    Route::get('/comment', [CommentController::class, 'index'])->name('comment.index');
    Route::get('/comment-count', [CommentController::class, 'count'])->name('comment.count');
    Route::patch('/comment/{id}/approve', [CommentController::class, 'approve'])->name('comment.approve');
    Route::delete('/comment/{id}', [CommentController::class, 'destroy'])->name('comment.destroy');
    Route::delete('/comments', [CommentController::class, 'bulkDestroy'])->name('comment.bulk_destroy');

    Route::apiResource('page', PageController::class)->names('page');
    Route::post('/page-export', [PageController::class, 'export'])->name('page.export');
    Route::delete('pages', [PageController::class, 'bulkDestroy'])->name('pages.bulk_destroy');

    Route::get('/properties/all', [PropertyController::class, 'all'])->name('properties.all');
    Route::get('/properties/active', [PropertyController::class, 'active'])->name('properties.active');
    Route::delete('/properties', [PropertyController::class, 'bulkDestroy'])->name('properties.bulk_destroy');
    Route::apiResource('properties', PropertyController::class)->names('properties');

    Route::delete('/property-types', [PropertyTypeController::class, 'bulkDestroy'])->name('property-types.bulk_destroy');
    Route::apiResource('property-types', PropertyTypeController::class)->names('property-types');

    Route::delete('/amenities', [AmenityController::class, 'bulkDestroy'])->name('amenities.bulk_destroy');
    Route::apiResource('amenities', AmenityController::class)->names('amenities');

    Route::post('/role-export', [RoleController::class, 'export'])->name('roles.export');
    Route::post('/role/{role}/permission', [RoleController::class, 'assignPermissions'])->name('roles.assign_permissions');
    Route::apiResource('role', RoleController::class)->names('roles');
    Route::delete('roles', [RoleController::class, 'bulkDestroy'])->name('roles.bulk_destroy');

    Route::post('/permission-export', [PermissionController::class, 'export'])->name('permissions.export');
    Route::apiResource('permission', PermissionController::class)->names('permissions');
    Route::delete('permissions', [PermissionController::class, 'bulkDestroy'])->name('permissions.bulk_destroy');
});
