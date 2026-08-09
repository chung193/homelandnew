<?php

namespace App\JsonApi\V1;

use LaravelJsonApi\Core\Server\Server as BaseServer;

class Server extends BaseServer
{
    public function serverVersion(): string
    {
        return 'v1';
    }

    public function allResources(): array
    {
        return [
            'properties' => \App\JsonApi\V1\Resources\PropertyResource::class,
            'property-types' => \App\JsonApi\V1\Resources\PropertyTypeResource::class,
            'amenities' => \App\JsonApi\V1\Resources\AmenityResource::class,
            'provinces' => \App\JsonApi\V1\Resources\ProvinceResource::class,
            'districts' => \App\JsonApi\V1\Resources\DistrictResource::class,
            'wards' => \App\JsonApi\V1\Resources\WardResource::class,
        ];
    }

    public function allSchemas(): array
    {
        return [
            'properties' => \App\JsonApi\V1\Schemas\PropertySchema::class,
            'property-types' => \App\JsonApi\V1\Schemas\PropertyTypeSchema::class,
            'amenities' => \App\JsonApi\V1\Schemas\AmenitySchema::class,
            'provinces' => \App\JsonApi\V1\Schemas\ProvinceSchema::class,
            'districts' => \App\JsonApi\V1\Schemas\DistrictSchema::class,
            'wards' => \App\JsonApi\V1\Schemas\WardSchema::class,
        ];
    }
}
