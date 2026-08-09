<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        $name = $this->faker->unique()->words(2, true);

        return [
            'name' => ucfirst($name),

            // slug unique
            'slug' => Str::slug($name) . '-' . $this->faker->unique()->numberBetween(100, 9999),

            'description' => $this->faker->optional()->sentence(),

            // mặc định chưa set parent (sẽ set trong seeder)
            'parent_id' => null,

            'sort_order' => $this->faker->numberBetween(0, 50),

            'is_active' => $this->faker->boolean(85), // 85% active
        ];
    }
}
