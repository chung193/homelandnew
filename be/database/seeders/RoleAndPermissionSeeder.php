<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create roles
        $adminRole = Role::firstOrCreate(
            ['name' => 'admin', 'guard_name' => 'api'],
            ['description' => 'Administrator role with full access']
        );

        $clientRole = Role::firstOrCreate(
            ['name' => 'client', 'guard_name' => 'api'],
            ['description' => 'Client role with limited access']
        );

        Role::firstOrCreate(
            ['name' => 'property_owner', 'guard_name' => 'api'],
            ['description' => 'Verified property owner']
        );

        $staffRole = Role::firstOrCreate(
            ['name' => 'staff', 'guard_name' => 'api'],
            ['description' => 'Staff role with operational access']
        );

        // You can add default permissions here if needed
        // Example:
        // $permission = Permission::firstOrCreate(
        //     ['name' => 'view-dashboard', 'guard_name' => 'api'],
        //     ['description' => 'View dashboard']
        // );
        // $adminRole->givePermissionTo($permission);
    }
}
