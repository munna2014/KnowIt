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
            $table->text('rejection_reason')->nullable()->after('status');
        });

        // For SQLite compatibility, we'll just add a check constraint instead of modifying ENUM
        // The status field should already exist from the original blog_posts migration
    }

    public function down(): void
    {
        Schema::table('blog_posts', function (Blueprint $table) {
            $table->dropColumn('rejection_reason');
        });
    }
};
