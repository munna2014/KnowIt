<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\BlogPostLike;
use Illuminate\Http\Request;

class BlogPostLikeController extends Controller
{
    public function status(Request $request, BlogPost $blogPost)
    {
        $liked = BlogPostLike::where('blog_post_id', $blogPost->id)
            ->where('user_id', $request->user()->id)
            ->exists();

        return response()->json([
            'liked' => $liked,
            'likes_count' => $blogPost->postLikes()->count(),
        ]);
    }

    public function toggle(Request $request, BlogPost $blogPost)
    {
        $existing = BlogPostLike::where('blog_post_id', $blogPost->id)
            ->where('user_id', $request->user()->id)
            ->first();

        if ($existing) {
            $existing->delete();
            $liked = false;
        } else {
            BlogPostLike::create([
                'blog_post_id' => $blogPost->id,
                'user_id' => $request->user()->id,
            ]);
            $liked = true;
        }

        return response()->json([
            'liked' => $liked,
            'likes_count' => $blogPost->postLikes()->count(),
        ]);
    }
}
