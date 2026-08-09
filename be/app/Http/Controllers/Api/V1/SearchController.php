<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Api\BaseApiController;
use App\Models\User;
use App\Models\Post;
use App\Models\Page;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SearchController extends BaseApiController
{
    /**
     * Global search across all models
     */
    public function global(Request $request): JsonResponse
    {
        try {
            $query = $request->query('q', '');
            $limit = $request->query('limit', 10);

            if (strlen($query) < 2) {
                return $this->successResponse([
                    'users' => [],
                    'posts' => [],
                    'pages' => [],
                    'categories' => [],
                ]);
            }

            // Search users
            $users = User::where('is_active', true)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%");
                })
                ->limit($limit)
                ->get(['id', 'name', 'email']);

            // Search posts
            $posts = Post::where('status', 'published')
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                })
                ->with('category')
                ->limit($limit)
                ->get(['id', 'name', 'slug', 'category_id', 'status']);

            // Search pages
            $pages = Page::where('status', 'published')
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                })
                ->limit($limit)
                ->get(['id', 'name', 'slug', 'status']);

            // Search categories
            $categories = Category::where('is_active', true)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                })
                ->limit($limit)
                ->get(['id', 'name', 'slug', 'description']);

            return $this->successResponse([
                'users' => $users,
                'posts' => $posts,
                'pages' => $pages,
                'categories' => $categories,
            ]);
        } catch (\Exception $e) {
            return $this->errorMessage($e->getMessage(), 500);
        }
    }

    /**
     * Search in specific model
     */
    public function posts(Request $request): JsonResponse
    {
        try {
            $query = $request->query('q', '');
            $limit = $request->query('limit', 20);

            if (strlen($query) < 2) {
                return $this->successResponse([]);
            }

            $posts = Post::where('status', 'published')
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                })
                ->with('category')
                ->limit($limit)
                ->get();

            return $this->successResponse($posts);
        } catch (\Exception $e) {
            return $this->errorMessage($e->getMessage(), 500);
        }
    }

    /**
     * Search pages
     */
    public function pages(Request $request): JsonResponse
    {
        try {
            $query = $request->query('q', '');
            $limit = $request->query('limit', 20);

            if (strlen($query) < 2) {
                return $this->successResponse([]);
            }

            $pages = Page::where('status', 'published')
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                })
                ->limit($limit)
                ->get();

            return $this->successResponse($pages);
        } catch (\Exception $e) {
            return $this->errorMessage($e->getMessage(), 500);
        }
    }

    /**
     * Search users
     */
    public function users(Request $request): JsonResponse
    {
        try {
            $query = $request->query('q', '');
            $limit = $request->query('limit', 20);

            if (strlen($query) < 2) {
                return $this->successResponse([]);
            }

            $users = User::where('is_active', true)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('email', 'like', "%{$query}%");
                })
                ->limit($limit)
                ->get(['id', 'name', 'email']);

            return $this->successResponse($users);
        } catch (\Exception $e) {
            return $this->errorMessage($e->getMessage(), 500);
        }
    }

    /**
     * Search categories
     */
    public function categories(Request $request): JsonResponse
    {
        try {
            $query = $request->query('q', '');
            $limit = $request->query('limit', 20);

            if (strlen($query) < 2) {
                return $this->successResponse([]);
            }

            $categories = Category::where('is_active', true)
                ->where(function ($q) use ($query) {
                    $q->where('name', 'like', "%{$query}%")
                        ->orWhere('description', 'like', "%{$query}%");
                })
                ->limit($limit)
                ->get();

            return $this->successResponse($categories);
        } catch (\Exception $e) {
            return $this->errorMessage($e->getMessage(), 500);
        }
    }
}
