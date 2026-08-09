<?php

use Illuminate\Support\Facades\Route;
use LaravelJsonApi\Laravel\Routing\Registrar;

Route::middleware('api')->group(function () {
    app(Registrar::class)->server('v1')->prefix('api/v1')->resources(function ($server) {
        $server->resource('properties');
        $server->resource('property-types');
        $server->resource('amenities');
        $server->resource('provinces');
        $server->resource('districts');
        $server->resource('wards');
    });
});
