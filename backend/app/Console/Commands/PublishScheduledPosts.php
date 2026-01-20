<?php

namespace App\Console\Commands;

use App\Models\BlogPost;
use Illuminate\Console\Command;

class PublishScheduledPosts extends Command
{
    protected $signature = 'blog:publish-scheduled';
    protected $description = 'Publish scheduled blog posts whose time has arrived';

    public function handle(): int
    {
        $posts = BlogPost::where('status', 'scheduled')
            ->whereNotNull('scheduled_at')
            ->where('scheduled_at', '<=', now())
            ->get();

        if ($posts->isEmpty()) {
            $this->info('No scheduled posts to publish.');
            return self::SUCCESS;
        }

        foreach ($posts as $post) {
            $post->update([
                'status' => 'published',
                'published_at' => $post->scheduled_at ?? now(),
                'rejection_reason' => null
            ]);
        }

        $this->info("Published {$posts->count()} scheduled posts.");
        return self::SUCCESS;
    }
}
