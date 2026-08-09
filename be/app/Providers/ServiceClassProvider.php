<?php

namespace App\Providers;

use App\Models\Role;
use App\Services\Client\Concretes\CategoryService as ClientCategoryService;
use App\Services\Client\Concretes\CommentService as ClientCommentService;
use App\Services\Client\Concretes\PostService as ClientPostService;
use App\Services\Client\Contracts\CategoryServiceInterface as ClientCategoryServiceInterface;
use App\Services\Client\Contracts\CommentServiceInterface as ClientCommentServiceInterface;
use App\Services\Client\Contracts\PostServiceInterface as ClientPostServiceInterface;
use App\Services\Concretes\AuthService;
use App\Services\Concretes\CategoryService;
use App\Services\Concretes\CommentService;
use App\Services\Concretes\PageService;
use App\Services\Concretes\PermissionService;
use App\Services\Concretes\PostService;
use App\Services\Concretes\PropertyService;
use App\Services\Concretes\PropertyTypeService;
use App\Services\Concretes\AmenityService;
use App\Services\Concretes\RoleService;
use App\Services\Concretes\TagService;
use App\Services\Concretes\UserService;
use App\Services\Contracts\AuthServiceInterface;
use App\Services\Contracts\CategoryServiceInterface;
use App\Services\Contracts\CommentServiceInterface;
use App\Services\Contracts\PageServiceInterface;
use App\Services\Contracts\PermissionServiceInterface;
use App\Services\Contracts\PostServiceInterface;
use App\Services\Contracts\PropertyServiceInterface;
use App\Services\Contracts\PropertyTypeServiceInterface;
use App\Services\Contracts\AmenityServiceInterface;
use App\Services\Contracts\RoleServiceInterface;
use App\Services\Contracts\TagServiceInterface;
use App\Services\Contracts\UserServiceInterface;
use Illuminate\Support\ServiceProvider as BaseServiceProvider;

class ServiceClassProvider extends BaseServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Client
        $this->app->bind(ClientCategoryServiceInterface::class, ClientCategoryService::class);
        $this->app->bind(ClientPostServiceInterface::class, ClientPostService::class);
        $this->app->bind(ClientCommentServiceInterface::class, ClientCommentService::class);

        // Admin
        $this->app->bind(UserServiceInterface::class, UserService::class);
        $this->app->bind(RoleServiceInterface::class, RoleService::class);
        $this->app->bind(PermissionServiceInterface::class, PermissionService::class);
        $this->app->bind(AuthServiceInterface::class, AuthService::class);
        $this->app->bind(CategoryServiceInterface::class, CategoryService::class);
        $this->app->bind(CommentServiceInterface::class, CommentService::class);
        $this->app->bind(TagServiceInterface::class, TagService::class);
        $this->app->bind(PageServiceInterface::class, PageService::class);
        $this->app->bind(PostServiceInterface::class, PostService::class);
        $this->app->bind(PropertyServiceInterface::class, PropertyService::class);
        $this->app->bind(PropertyTypeServiceInterface::class, PropertyTypeService::class);
        $this->app->bind(AmenityServiceInterface::class, AmenityService::class);
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
