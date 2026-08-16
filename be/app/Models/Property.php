<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\MediaLibrary\HasMedia;
use Spatie\MediaLibrary\InteractsWithMedia;
use Spatie\MediaLibrary\MediaCollections\Models\Media;
use Spatie\Image\Enums\Fit;

class Property extends Model implements HasMedia
{
    use HasFactory;
    use SoftDeletes;
    use InteractsWithMedia;

    protected $table = 'properties';

    protected $fillable = [
        'user_id',
        'property_type_id',
        'listing_type',
        'title',
        'slug',
        'address',
        'address_detail',
        'city',
        'district',
        'ward',
        'latitude',
        'longitude',
        'price',
        'price_unit',
        'long_term_months', 'long_term_price', 'deposit_amount',
        'area',
        'bedrooms',
        'bathrooms',
        'floor',
        'legal_info',
        'description',
        'status',
        'is_active',
        'is_deleted',
        'qr_code',
        'qr_generated_at',
        'posting_fee',
        'views',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'area' => 'decimal:2',
        'latitude' => 'decimal:8',
        'longitude' => 'decimal:8',
        'is_active' => 'boolean',
        'is_deleted' => 'boolean',
        'qr_generated_at' => 'datetime',
        'posting_fee' => 'integer',
        'views' => 'integer',
        'long_term_months' => 'integer', 'long_term_price' => 'decimal:2', 'deposit_amount' => 'decimal:2',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function propertyType(): BelongsTo
    {
        return $this->belongsTo(PropertyType::class);
    }

    public function amenities(): BelongsToMany
    {
        return $this->belongsToMany(Amenity::class, 'property_amenity')
            ->withTimestamps();
    }

    public function bookings(): HasMany
    {
        return $this->hasMany(Booking::class);
    }

    public function viewingAppointments(): HasMany
    {
        return $this->hasMany(ViewingAppointment::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(PropertyReview::class);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('is_deleted', false);
    }

    public function registerMediaConversions(?Media $media = null): void
    {
        $this
            ->addMediaConversion('preview')
            ->fit(Fit::Contain, 300, 300)
            ->nonQueued();
    }

    public function registerMediaCollections(): void
    {
        $this->addMediaCollection('gallery');
        $this->addMediaCollection('featured_image')->singleFile();
    }
}
