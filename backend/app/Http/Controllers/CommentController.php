<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Comment;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(BlogPost $blogPost)
    {
        if ($blogPost->status !== 'published') {
            return response()->json(['message' => 'Comments are not available.'], 403);
        }

        $comments = Comment::with([
                'user:id,name,first_name,last_name,avatar_url,avatar_path',
                'replies' => function ($query) {
                    $query->where('status', 'approved');
                },
                'replies.user:id,name,first_name,last_name,avatar_url,avatar_path',
            ])
            ->where('blog_post_id', $blogPost->id)
            ->whereNull('parent_id')
            ->where('status', 'approved')
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'comments' => $comments,
        ]);
    }

    public function store(Request $request, BlogPost $blogPost)
    {
        if ($blogPost->status !== 'published') {
            return response()->json(['message' => 'You cannot comment on this post.'], 403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:1000'],
            'parent_id' => ['nullable', 'integer', 'exists:comments,id'],
        ]);

        $parentId = $validated['parent_id'] ?? null;
        if ($parentId) {
            $parentComment = Comment::where('id', $parentId)
                ->where('blog_post_id', $blogPost->id)
                ->first();
            if (!$parentComment) {
                return response()->json(['message' => 'Invalid parent comment.'], 422);
            }
            if ($request->user()->id !== $blogPost->user_id) {
                return response()->json(['message' => 'Only the author can reply.'], 403);
            }
        }

        $status = $this->getInitialStatus($validated['body']);

        $comment = Comment::create([
            'blog_post_id' => $blogPost->id,
            'user_id' => $request->user()->id,
            'body' => $validated['body'],
            'parent_id' => $parentId,
            'status' => $status,
        ]);

        $comment->load('user:id,name,first_name,last_name,avatar_url,avatar_path');

        return response()->json([
            'message' => $status === 'approved' ? 'Comment added.' : 'Comment submitted for review.',
            'comment' => $comment,
        ], 201);
    }

    public function update(Request $request, Comment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:1000'],
        ]);

        $comment->update([
            'body' => $validated['body'],
            'status' => $this->getInitialStatus($validated['body']),
        ]);

        $comment->load('user:id,name,first_name,last_name,avatar_url,avatar_path');

        return response()->json([
            'message' => 'Comment updated.',
            'comment' => $comment,
        ]);
    }

    public function destroy(Request $request, Comment $comment)
    {
        if ($comment->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted.',
        ]);
    }

    private function getInitialStatus(string $body): string
    {
        $lower = strtolower($body);
        $keywords = [
            'buy now',
            'free money',
            'visit now',
            'work from home',
            'limited offer',
            'viagra',
            'casino',
            'porn',
        ];

        foreach ($keywords as $keyword) {
            if (str_contains($lower, $keyword)) {
                return 'spam';
            }
        }

        if (preg_match('/(https?:\\/\\/|www\\.)/i', $body)) {
            return 'spam';
        }

        return 'pending';
    }
}
