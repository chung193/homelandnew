<?php

namespace App\Providers;

use App\Models\Role;
use App\Repositories\Role\Contracts\RoleRepositoryInterface;
use App\Repositories\Role\Concretes\RoleRepository;
use App\Repositories\Permission\Contracts\PermissionRepositoryInterface;
use App\Repositories\Permission\Concretes\PermissionRepository;
use App\Repositories\User\Concretes\UserRepository;
use App\Repositories\User\Contracts\UserRepositoryInterface;
use App\Repositories\Category\Concretes\CategoryRepository;
use App\Repositories\Category\Contracts\CategoryRepositoryInterface;
use App\Repositories\Comment\Concretes\CommentRepository;
use App\Repositories\Comment\Contracts\CommentRepositoryInterface;
use App\Repositories\Post\Concretes\PostRepository;
use App\Repositories\Post\Contracts\PostRepositoryInterface;
use App\Repositories\Tag\Concretes\TagRepository;
use App\Repositories\Tag\Contracts\TagRepositoryInterface;
use App\Repositories\Page\Concretes\PageRepository;
use App\Repositories\Page\Contracts\PageRepositoryInterface;
use App\Repositories\Property\Concretes\PropertyRepository;
use App\Repositories\Property\Contracts\PropertyRepositoryInterface;
use App\Repositories\PropertyType\Concretes\PropertyTypeRepository;
use App\Repositories\PropertyType\Contracts\PropertyTypeRepositoryInterface;
use App\Repositories\Amenity\Concretes\AmenityRepository;
use App\Repositories\Amenity\Contracts\AmenityRepositoryInterface;
use Illuminate\Support\ServiceProvider;

class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
        // Register repository bindings here
        $this->app->bind(
            UserRepositoryInterface::class,
            UserRepository::class,
        );

        $this->app->bind(
            PostRepositoryInterface::class,
            PostRepository::class,
        );

        $this->app->bind(
            PageRepositoryInterface::class,
            PageRepository::class,
        );

        $this->app->bind(
            CategoryRepositoryInterface::class,
            CategoryRepository::class,
        );

        $this->app->bind(
            TagRepositoryInterface::class,
            TagRepository::class,
        );

        $this->app->bind(
            CommentRepositoryInterface::class,
            CommentRepository::class,
        );

        $this->app->bind(
            RoleRepositoryInterface::class,
            RoleRepository::class,
        );

        $this->app->bind(
            PermissionRepositoryInterface::class,
            PermissionRepository::class,
        );

        $this->app->bind(
            PropertyRepositoryInterface::class,
            PropertyRepository::class,
        );

        $this->app->bind(
            PropertyTypeRepositoryInterface::class,
            PropertyTypeRepository::class,
        );

        $this->app->bind(
            AmenityRepositoryInterface::class,
            AmenityRepository::class,
        );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
