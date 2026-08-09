<?php

namespace Database\Factories;

use App\Models\Post;
use App\Models\User;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PostFactory extends Factory
{
    protected $model = Post::class;

    public function definition(): array
    {
        $title = $this->faker->sentence(6);

        return [
            'name' => $title,

            // slug unique
            'slug' => Str::slug($title) . '-' . $this->faker->unique()->numberBetween(1000, 999999),

            'description' => $this->faker->optional()->paragraph(),

            'content' => $this->faker->paragraphs(12, true),

            // random category (có thể null)
            'category_id' => $this->faker->boolean(90)
                ? Category::inRandomOrder()->first()?->id
                : null,

            // random user
            'user_id' => User::inRandomOrder()->first()->id,

            'status' => $this->faker->randomElement([
                'draft',
                'published',
                'pending',
                'archived',
            ]),

            'type' => $this->faker->randomElement([
                'article',
                'news',
                'tutorial',
                'review',
                'story'
            ]),

            'views' => $this->faker->numberBetween(0, 100000),

            'published_at' => $this->faker->optional(0.6)
                ->dateTimeBetween('-2 years', 'now'),

            'featured' => $this->faker->boolean(12), // 12% nổi bật

            'allow_comments' => $this->faker->boolean(90),
        ];
    }

    /**
     * State: Published post
     */
    public function published()
    {
        return $this->state(fn() => [
            'status' => 'published',
            'published_at' => now(),
        ]);
    }
}
