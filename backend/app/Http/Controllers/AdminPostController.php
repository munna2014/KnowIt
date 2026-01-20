<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\BlogPost;
use Illuminate\Http\Request;

class AdminPostController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    /**
     * Get posts with pagination and filters
     */
    public function index(Request $request)
    {
        $query = BlogPost::with(['user:id,name,email,avatar_url']);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Add counts
        $query->withCount(['comments', 'postLikes as likes_count']);

        $posts = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('limit', 10));

        return response()->json([
            'posts' => $posts->items(),
            'totalPages' => $posts->lastPage(),
            'currentPage' => $posts->currentPage(),
            'total' => $posts->total()
        ]);
    }

    /**
     * Get single post details
     */
    public function show($id)
    {
        $post = BlogPost::with(['user:id,name,email,avatar_url'])
            ->withCount(['comments', 'postLikes as likes_count'])
            ->findOrFail($id);

        return response()->json([
            'post' => $post
        ]);
    }

    /**
     * Update post
     */
    public function update(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);
        $before = $post->only(['title', 'content', 'excerpt', 'category', 'status', 'featured_image']);

        $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'excerpt' => 'sometimes|string|max:500',
            'category' => 'sometimes|string|max:100',
            'status' => 'sometimes|in:draft,review,scheduled,published,archived',
            'featured_image_url' => 'sometimes|url',
            'rejection_reason' => 'sometimes|string|max:2000',
            'scheduled_at' => 'sometimes|date'
        ]);

        $post->update($request->only([
            'title',
            'content',
            'excerpt',
            'category',
            'status',
            'featured_image_url',
            'rejection_reason',
            'scheduled_at'
        ]));

        if ($request->input('status') === 'scheduled') {
            $post->update([
                'published_at' => null
            ]);
        }

        $after = $post->only(['title', 'content', 'excerpt', 'category', 'status', 'featured_image']);
        $changed = [];
        foreach ($after as $key => $value) {
            if ($before[$key] !== $value) {
                $changed[$key] = [
                    'before' => $before[$key],
                    'after' => $value
                ];
            }
        }

        $this->logAdminAction($request, 'edit_post', BlogPost::class, $post->id, [
            'title' => $post->title,
            'changes' => $changed
        ]);

        return response()->json([
            'message' => 'Post updated successfully',
            'post' => $post->load('user')
        ]);
    }

    /**
     * Publish post
     */
    public function publish(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);
        $previousStatus = $post->status;
        $scheduledAt = $post->scheduled_at;
        $shouldSchedule = $scheduledAt && $scheduledAt->isFuture();

        $post->update([
            'status' => $shouldSchedule ? 'scheduled' : 'published',
            'published_at' => $shouldSchedule ? null : now(),
            'rejection_reason' => null
        ]);

        $this->logAdminAction($request, $shouldSchedule ? 'schedule_post' : 'publish_post', BlogPost::class, $post->id, [
            'title' => $post->title,
            'from' => $previousStatus,
            'to' => $shouldSchedule ? 'scheduled' : 'published'
        ]);

        return response()->json([
            'message' => 'Post published successfully'
        ]);
    }

    /**
     * Unpublish post
     */
    public function unpublish($id)
    {
        $post = BlogPost::findOrFail($id);
        $post->update([
            'status' => 'draft',
            'published_at' => null
        ]);

        return response()->json([
            'message' => 'Post unpublished successfully'
        ]);
    }

    /**
     * Approve post (review -> published)
     */
    public function approve(Request $request, $id)
    {
        $post = BlogPost::findOrFail($id);
        $previousStatus = $post->status;
        $scheduledAt = $post->scheduled_at;
        $shouldSchedule = $scheduledAt && $scheduledAt->isFuture();

        $post->update([
            'status' => $shouldSchedule ? 'scheduled' : 'published',
            'published_at' => $shouldSchedule ? null : now(),
            'rejection_reason' => null
        ]);

        $this->logAdminAction($request, $shouldSchedule ? 'schedule_post' : 'publish_post', BlogPost::class, $post->id, [
            'title' => $post->title,
            'from' => $previousStatus,
            'to' => $shouldSchedule ? 'scheduled' : 'published'
        ]);

        return response()->json([
            'message' => 'Post approved successfully'
        ]);
    }

    /**
     * Reject post (review -> archived) with reason
     */
    public function reject(Request $request, $id)
    {
        $validated = $request->validate([
            'rejection_reason' => 'required|string|max:2000'
        ]);

        $post = BlogPost::findOrFail($id);
        $post->update([
            'status' => 'archived',
            'published_at' => null,
            'rejection_reason' => $validated['rejection_reason'],
            'scheduled_at' => null
        ]);

        return response()->json([
            'message' => 'Post rejected successfully'
        ]);
    }

    private function logAdminAction(Request $request, string $action, string $targetType, ?int $targetId, array $metadata = []): void
    {
        $admin = $request->user();
        if (!$admin) {
            return;
        }

        AuditLog::create([
            'admin_id' => $admin->id,
            'action' => $action,
            'target_type' => $targetType,
            'target_id' => $targetId,
            'metadata' => $metadata,
        ]);
    }

    /**
     * Delete post
     */
    public function destroy($id)
    {
        $post = BlogPost::findOrFail($id);
        $post->delete();

        return response()->json([
            'message' => 'Post deleted successfully'
        ]);
    }
}
