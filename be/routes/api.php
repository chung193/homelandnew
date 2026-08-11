<?php

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

Route::get('ping', function () {
    return 'API is working!';
});

Route::prefix('json-api')->group(function () {
    Route::get('properties', [\App\Http\Controllers\Api\V1\JsonApi\PropertyJsonApiController::class, 'index']);
    Route::get('properties/{property}', [\App\Http\Controllers\Api\V1\JsonApi\PropertyJsonApiController::class, 'show']);
    Route::post('properties/{property}/view', [\App\Http\Controllers\Api\V1\JsonApi\PropertyJsonApiController::class, 'recordView']);
});

Route::prefix('locations')->group(function () {
    Route::get('provinces', [\App\Http\Controllers\Api\V1\LocationController::class, 'provinces']);
    Route::get('districts', [\App\Http\Controllers\Api\V1\LocationController::class, 'districts']);
    Route::get('wards', [\App\Http\Controllers\Api\V1\LocationController::class, 'wards']);
});
