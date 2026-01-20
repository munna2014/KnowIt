<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("UPDATE users SET role = 'user' WHERE role = 'moderator'");
        DB::statement("ALTER TABLE users MODIFY role ENUM('user','admin') DEFAULT 'user'");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE users MODIFY role ENUM('user','admin','moderator') DEFAULT 'user'");
    }
};
