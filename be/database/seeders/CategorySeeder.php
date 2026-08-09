<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Tạo 50 category cha
        $parents = Category::factory()
            ->count(50)
            ->create();

        // Tạo 150 category con
        Category::factory()
            ->count(150)
            ->make() // chưa lưu DB
            ->each(function ($category) use ($parents) {
                $category->parent_id = $parents->random()->id;
                $category->save();
            });
    }
}
