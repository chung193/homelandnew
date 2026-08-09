<?php

namespace Database\Factories;

use App\Models\UserDetail;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserDetailFactory extends Factory
{
    protected $model = UserDetail::class;

    public function definition(): array
    {
        return [
            'phone' => $this->faker->phoneNumber(),

            'address' => $this->faker->streetAddress(),

            'city' => $this->faker->city(),

            'description' => $this->faker->sentence(),

            'position' => $this->faker->jobTitle(),

            'website' => $this->faker->url(),

            'github' => 'https://github.com/' . $this->faker->userName(),

            'join_date' => $this->faker->dateTimeBetween('-5 years', 'now'),

            'birthday' => $this->faker->dateTimeBetween('-40 years', '-18 years'),
        ];
    }
}
