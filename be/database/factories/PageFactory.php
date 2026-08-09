<?php

namespace Database\Factories;

use App\Models\Page;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PageFactory extends Factory
{
    protected $model = Page::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(5);

        return [
            'name' => $title,

            // slug unique
            'slug' => Str::slug($title) . '-' . $this->faker->unique()->numberBetween(1000, 999999),

            'description' => $this->faker->optional()->paragraph(),

            'content' => $this->faker->paragraphs(10, true),

            // random user có sẵn
            'user_id' => User::inRandomOrder()->first()->id,

            'status' => $this->faker->randomElement([
                'draft',
                'published',
                'pending',
                'archived'
            ]),

            'type' => $this->faker->randomElement([
                'article',
                'news',
                'tutorial',
                'review'
            ]),

            'views' => $this->faker->numberBetween(0, 50000),

            'published_at' => $this->faker->optional()->dateTimeBetween('-2 years', 'now'),

            'featured' => $this->faker->boolean(15), // 15% true

            'allow_comments' => $this->faker->boolean(90), // 90% true
        ];
    }
}
