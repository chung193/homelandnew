<?php

namespace App\JsonApi\V1\Schemas;

use App\Models\Ward;
use LaravelJsonApi\Core\Schema\Schema;

class WardSchema extends Schema
{
    public static string $model = Ward::class;

    public function fields(): array
    {
        return [
            'province-code' => $this->numberField(),
            'district-code' => $this->numberField(),
            'code' => $this->numberField(),
            'name' => $this->stringField(),
            'name-en' => $this->stringField(),
            'full-name' => $this->stringField(),
            'full-name-en' => $this->stringField(),
            'division-type' => $this->stringField(),
            'codename' => $this->stringField(),
            'is-active' => $this->booleanField(),
        ];
    }
}
