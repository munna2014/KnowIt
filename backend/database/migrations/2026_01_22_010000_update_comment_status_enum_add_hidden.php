<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement(
            "ALTER TABLE comments MODIFY status ENUM('approved','pending','rejected','spam','hidden') DEFAULT 'pending'"
        );
    }

    public function down(): void
    {
        DB::statement(
            "ALTER TABLE comments MODIFY status ENUM('approved','pending','rejected','spam') DEFAULT 'approved'"
        );
    }
};
