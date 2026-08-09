<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\UserDetail;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'chungvd.it@gmail.com',
            'password' => bcrypt('12345678'),
        ]);
        $user->assignRole('admin');

        UserDetail::factory()->create([
            'user_id' => 1,
            'phone' => '0796496199',
            'address' => 'Ngô Quyền',
            'city' => 'Hải Phòng',
            'description' => 'Trầm tính',
            'position' => 'Lập trình viên',
            'website' => 'https://chungvd.com',
            'github' => 'https://github.com/chung193',
            'join_date' => now(),
            'birthday' => now(),
        ]);
    }
}
