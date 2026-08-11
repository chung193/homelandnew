<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config(['jwt.secret' => env('JWT_SECRET', 'test-suite-jwt-secret')]);
    }
}
