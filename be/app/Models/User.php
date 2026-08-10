<?php

namespace App\Models;

use Eloquent;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Notifications\DatabaseNotificationCollection;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Carbon;
use Spatie\Permission\Traits\HasRoles;
use Tymon\JWTAuth\Contracts\JWTSubject;
use App\Traits\HasMediaImageConversions;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use App\Notifications\VerifyEmailNotification;

class User extends Authenticatable implements JWTSubject, HasMedia, MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, HasRoles, Notifiable;

    use InteractsWithMedia, HasMediaImageConversions {
        HasMediaImageConversions::registerMediaConversions insteadof InteractsWithMedia;
    }
    protected $keyType = 'int';
    protected $primaryKey = 'id';
    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'is_active',
        'registration_source',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /**
     * Get the identifier that will be stored in the subject claim of the JWT.
     */
    public function getJWTIdentifier(): mixed
    {
        return $this->getKey();
    }

    /**
     * Return a key value array, containing any custom claims to be added to the JWT.
     *
     * @return array<string, mixed>
     */
    public function getJWTCustomClaims(): array
    {
        return [];
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('avatar')->singleFile();
    }

    public function detail()
    {
        return $this->hasOne(UserDetail::class);
    }

    public function properties()
    {
        return $this->hasMany(Property::class);
    }

    public function sendEmailVerificationNotification()
    {
        $this->notify(new VerifyEmailNotification());
    }

    public function isAdmin(): bool
    {
        return $this->getRoleNames()
            ->map(fn(string $role) => strtolower(trim($role)))
            ->intersect(['admin', 'super-admin', 'super admin'])
            ->isNotEmpty();
    }
}
