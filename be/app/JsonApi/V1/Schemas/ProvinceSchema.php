<?php

namespace App\JsonApi\V1\Schemas;

use App\Models\Province;
use LaravelJsonApi\Core\Schema\Schema;

class ProvinceSchema extends Schema
{
    public static string $model = Province::class;

    public function fields(): array
    {
        return [
            'code' => $this->numberField(),
            'name' => $this->stringField(),
            'name-en' => $this->stringField(),
            'full-name' => $this->stringField(),
            'full-name-en' => $this->stringField(),
            'division-type' => $this->stringField(),
            'codename' => $this->stringField(),
            'phone-code' => $this->numberField(),
            'order-level' => $this->numberField(),
            'is-active' => $this->booleanField(),
        ];
    }
}
