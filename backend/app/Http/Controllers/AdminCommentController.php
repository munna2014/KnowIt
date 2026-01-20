<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\Comment;
use Illuminate\Http\Request;

class AdminCommentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    /**
     * Get comments with pagination and filters
     */
    public function index(Request $request)
    {
        $query = Comment::with([
            'user:id,name,email,avatar_url',
            'post:id,title,slug'
        ]);

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('body', 'like', "%{$search}%")
                  ->orWhereHas('user', function ($userQuery) use ($search) {
                      $userQuery->where('name', 'like', "%{$search}%")
                               ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        $comments = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('limit', 10));

        return response()->json([
            'comments' => $comments->items(),
            'totalPages' => $comments->lastPage(),
            'currentPage' => $comments->currentPage(),
            'total' => $comments->total()
        ]);
    }

    /**
     * Approve comment
     */
    public function approve(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update(['status' => 'approved']);

        $this->logAdminAction($request, 'approve_comment', Comment::class, $id);

        return response()->json([
            'message' => 'Comment approved successfully'
        ]);
    }

    /**
     * Reject comment
     */
    public function reject(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update(['status' => 'rejected']);

        $this->logAdminAction($request, 'reject_comment', Comment::class, $id);

        return response()->json([
            'message' => 'Comment rejected successfully'
        ]);
    }

    /**
     * Hide comment
     */
    public function hide(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $comment->update(['status' => 'hidden']);

        $this->logAdminAction($request, 'hide_comment', Comment::class, $id);

        return response()->json([
            'message' => 'Comment hidden successfully'
        ]);
    }

    /**
     * Delete comment
     */
    public function destroy(Request $request, $id)
    {
        $comment = Comment::findOrFail($id);
        $postId = $comment->blog_post_id;
        $comment->delete();

        $this->logAdminAction($request, 'delete_comment', Comment::class, $id, [
            'post_id' => $postId
        ]);

        return response()->json([
            'message' => 'Comment deleted successfully'
        ]);
    }

    /**
     * Bulk moderation actions
     */
    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|in:approve,hide,delete',
            'ids' => 'required|array',
            'ids.*' => 'integer'
        ]);

        $ids = $validated['ids'];
        $action = $validated['action'];

        if ($action === 'delete') {
            Comment::whereIn('id', $ids)->delete();
        } else {
            $status = $action === 'approve' ? 'approved' : 'hidden';
            Comment::whereIn('id', $ids)->update(['status' => $status]);
        }

        $this->logAdminAction($request, 'bulk_comment_action', Comment::class, null, [
            'action' => $action,
            'ids' => $ids
        ]);

        return response()->json([
            'message' => 'Bulk action completed'
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
}
