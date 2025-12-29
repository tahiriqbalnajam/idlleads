<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create permissions
        $permissions = [
            'view menu users',
            'view menu deals',
            'create users',
            'edit users',
            'delete users',
            'create deals',
            'edit deals',
            'delete deals',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Assign permissions to roles
        $superAdmin = Role::findByName('super admin');
        $superAdmin->givePermissionTo(Permission::all());

        $managers = Role::findByName('managers');
        $managers->givePermissionTo(['view menu deals', 'create deals', 'edit deals', 'delete deals']);

        $marketers = Role::findByName('marketers');
        $marketers->givePermissionTo(['view menu deals', 'create deals', 'edit deals']);
    }
}
