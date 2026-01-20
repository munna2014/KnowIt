<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->timestamp('scheduled_at')->nullable()->after('rejection_reason');
        });

        DB::statement(
            "ALTER TABLE blog_posts MODIFY status ENUM('draft','review','scheduled','published','archived') DEFAULT 'draft'"
        );
    }

    public function down(): void
    {
        DB::statement(
            "ALTER TABLE blog_posts MODIFY status ENUM('draft','review','published','archived') DEFAULT 'draft'"
        );

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn('scheduled_at');
        });
    }
};
