<?php

use App\Http\Controllers\Api\V1\AmenityController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\BookingController;
use App\Http\Controllers\Api\V1\ViewingAppointmentController;
use App\Http\Controllers\Api\V1\IdentityVerificationController;
use App\Http\Controllers\Api\V1\AccountTypeController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\Client\CategoryController as ClientCategoryController;
use App\Http\Controllers\Api\V1\Client\CommentController as ClientCommentController;
use App\Http\Controllers\Api\V1\Client\PostController as ClientPostController;
use App\Http\Controllers\Api\V1\Client\TagController as ClientTagController;
use App\Http\Controllers\Api\V1\CommentController;
use App\Http\Controllers\Api\V1\DistrictController;
use App\Http\Controllers\Api\V1\LocationController;
use App\Http\Controllers\Api\V1\MediaController;
use App\Http\Controllers\Api\V1\OwnerApplicationController;
use App\Http\Controllers\Api\V1\PageController;
use App\Http\Controllers\Api\V1\PermissionController;
use App\Http\Controllers\Api\V1\PostController;
use App\Http\Controllers\Api\V1\PropertyController;
use App\Http\Controllers\Api\V1\PropertyReviewController;
use App\Http\Controllers\Api\V1\SavedPropertyController;
use App\Http\Controllers\Api\V1\PropertyTypeController;
use App\Http\Controllers\Api\V1\ProvinceController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\SearchController;
use App\Http\Controllers\Api\V1\StatisticsController;
use App\Http\Controllers\Api\V1\TagController;
use App\Http\Controllers\Api\V1\UploadFileController;
// client
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\WalletController;
use App\Http\Controllers\Api\V1\WardController;
use Illuminate\Support\Facades\Route;

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
        Route::post('email/resend', [AuthController::class, 'resend'])->middleware(['auth:api', 'account.active'])->name('resend.verify.email');
        // Protected routes
        Route::group(['middleware' => ['auth:api', 'account.active']], function () {
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
Route::get('/properties/{property}/availability', [BookingController::class, 'availability'])->name('properties.availability');
Route::get('/account-types/active', [AccountTypeController::class, 'active']);
Route::get('/properties/{property}/reviews', [PropertyReviewController::class, 'index'])->name('properties.reviews.index');
Route::post('/payments/momo/ipn', [WalletController::class, 'momoIpn'])->name('payments.momo.ipn');

Route::group(['middleware' => ['auth:api', 'account.active']], function () {
    Route::get('/saved-properties', [SavedPropertyController::class, 'index']);
    Route::post('/saved-properties', [SavedPropertyController::class, 'store']);
    Route::delete('/saved-properties/{property}', [SavedPropertyController::class, 'destroy']);
    Route::get('/identity-verification', [IdentityVerificationController::class, 'show']);
    Route::get('/admin/account-types', [AccountTypeController::class, 'index']);
    Route::post('/admin/account-types', [AccountTypeController::class, 'store']);
    Route::put('/admin/account-types/{accountType}', [AccountTypeController::class, 'update']);
    Route::post('/identity-verification', [IdentityVerificationController::class, 'store']);
    Route::get('/admin/identity-verifications', [IdentityVerificationController::class, 'index']);
    Route::patch('/admin/identity-verifications/{verification}', [IdentityVerificationController::class, 'review']);
    Route::get('/admin/identity-verifications/{verification}/documents/{side}', [IdentityVerificationController::class, 'document']);
    Route::post('/viewing-appointments', [ViewingAppointmentController::class, 'store']);
    Route::get('/my-viewing-appointments', [ViewingAppointmentController::class, 'mine']);
    Route::get('/owner/viewing-appointments', [ViewingAppointmentController::class, 'owner']);
    Route::patch('/viewing-appointments/{viewingAppointment}/confirm', [ViewingAppointmentController::class, 'confirm']);
    Route::patch('/viewing-appointments/{viewingAppointment}/reject', [ViewingAppointmentController::class, 'reject']);
    Route::patch('/viewing-appointments/{viewingAppointment}/cancel', [ViewingAppointmentController::class, 'cancel']);
    Route::post('/bookings', [BookingController::class, 'store'])->name('bookings.store');
    Route::post('/properties/{property}/reviews', [PropertyReviewController::class, 'store'])->name('properties.reviews.store');
    Route::get('/properties/{property}/review-eligibility', [PropertyReviewController::class, 'eligibility'])->name('properties.reviews.eligibility');
    Route::get('/owner-application', [OwnerApplicationController::class, 'show'])->name('owner-application.show');
    Route::post('/owner-application', [OwnerApplicationController::class, 'store'])->name('owner-application.store');
    Route::get('/admin/owner-applications', [OwnerApplicationController::class, 'index'])->name('owner-applications.index');
    Route::get('/admin/owner-applications/{application}', [OwnerApplicationController::class, 'adminShow'])->name('owner-applications.show');
    Route::patch('/admin/owner-applications/{application}', [OwnerApplicationController::class, 'review'])->name('owner-applications.review');
    Route::patch('/admin/owner-applications/{application}/test-posting-credits', [OwnerApplicationController::class, 'setTestPostingCredits'])->name('owner-applications.test-posting-credits');
    Route::get('/admin/owner-applications/{application}/documents/{type}', [OwnerApplicationController::class, 'document'])->name('owner-applications.document');
    Route::get('/wallet', [WalletController::class, 'show'])->name('wallet.show');
    Route::post('/wallet/momo', [WalletController::class, 'createMomoPayment'])->name('wallet.momo.create');
    Route::get('/my-bookings', [BookingController::class, 'myBookings'])->name('bookings.mine');
    Route::get('/owner/bookings', [BookingController::class, 'ownerBookings'])->name('bookings.owner');
    Route::patch('/bookings/{booking}/cancel', [BookingController::class, 'cancel'])->name('bookings.cancel');
    Route::patch('/bookings/{booking}/approve', [BookingController::class, 'approve'])->name('bookings.approve');
    Route::patch('/bookings/{booking}/reject', [BookingController::class, 'reject'])->name('bookings.reject');
    Route::patch('/bookings/{booking}/start', [BookingController::class, 'start'])->name('bookings.start');
    Route::patch('/bookings/{booking}/complete', [BookingController::class, 'complete'])->name('bookings.complete');

    // Statistics routes
    Route::get('/statistics/dashboard', [StatisticsController::class, 'dashboard'])->name('statistics.dashboard');
    Route::get('/statistics/monthly-trends', [StatisticsController::class, 'monthlyTrends'])->name('statistics.monthly-trends');

    Route::get('users/active', [UserController::class, 'active'])->name('users.active');
    Route::get('users/all', [UserController::class, 'all'])->name('users.all');
    Route::apiResource('user', UserController::class)->names('users');
    Route::delete('users', [UserController::class, 'bulkDestroy'])->name('users.bulk_destroy');
    Route::post('/user/{user}/role', [UserController::class, 'assignRoles'])->name('user.assign_roles');
    Route::patch('/user/{user}/force-logout', [UserController::class, 'forceLogout'])->name('user.force_logout');
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

    Route::delete('/provinces', [ProvinceController::class, 'bulkDestroy'])->name('provinces.bulk_destroy');
    Route::apiResource('provinces', ProvinceController::class)->names('provinces');

    Route::delete('/districts', [DistrictController::class, 'bulkDestroy'])->name('districts.bulk_destroy');
    Route::apiResource('districts', DistrictController::class)->names('districts');

    Route::delete('/wards', [WardController::class, 'bulkDestroy'])->name('wards.bulk_destroy');
    Route::apiResource('wards', WardController::class)->names('wards');

    Route::post('/role-export', [RoleController::class, 'export'])->name('roles.export');
    Route::post('/role/{role}/permission', [RoleController::class, 'assignPermissions'])->name('roles.assign_permissions');
    Route::apiResource('role', RoleController::class)->names('roles');
    Route::delete('roles', [RoleController::class, 'bulkDestroy'])->name('roles.bulk_destroy');

    Route::post('/permission-export', [PermissionController::class, 'export'])->name('permissions.export');
    Route::apiResource('permission', PermissionController::class)->names('permissions');
    Route::delete('permissions', [PermissionController::class, 'bulkDestroy'])->name('permissions.bulk_destroy');
});
