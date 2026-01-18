<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class TestUserSeeder extends Seeder
{
    /**
     * Run the database seeder.
     */
    public function run(): void
    {
        // Create test user if it doesn't exist
        $email = 'munnakarim33@gmail.com';
        
        if (!User::where('email', $email)->exists()) {
            User::create([
                'name' => 'Dark Night',
                'first_name' => 'Dark',
                'last_name' => 'Night',
                'email' => $email,
                'password' => Hash::make('password123'), // Default password
                'email_verified_at' => now(),
                'bio' => 'A passionate writer and developer who loves sharing insights about technology, life, and everything in between. Always curious and eager to learn new things.',
            ]);
            
            $this->command->info("Test user created: {$email} / password123");
        } else {
            $this->command->info("Test user already exists: {$email}");
        }
    }
}