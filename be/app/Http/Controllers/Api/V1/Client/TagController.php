<?php

namespace App\Http\Controllers\Api\V1\Client;

use App\Http\Controllers\Api\BaseApiController;
use App\Http\Resources\Api\Tag\TagResource;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;

class TagController extends BaseApiController
{
    /**
     * Display all tags.
     */
    public function index(): JsonResponse
    {
        $tags = Tag::query()
            ->orderBy('name')
            ->get();

        return $this->successResponse(TagResource::collection($tags));
    }
}
