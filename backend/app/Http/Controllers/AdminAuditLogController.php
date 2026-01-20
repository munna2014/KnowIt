<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\BlogPost;
use App\Models\Comment;
use Illuminate\Http\Request;

class AdminAuditLogController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    public function index(Request $request)
    {
        $query = AuditLog::with('admin:id,name,email');

        if ($request->has('action') && $request->action) {
            $query->where('action', $request->action);
        }

        if ($request->has('target_type') && $request->target_type) {
            $query->where('target_type', $request->target_type);
        }

        $logs = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('limit', 20));

        $items = $logs->items();
        $postIds = [];
        $commentIds = [];

        foreach ($items as $log) {
            if ($log->target_type === BlogPost::class && $log->target_id) {
                $postIds[] = $log->target_id;
            } elseif ($log->target_type === Comment::class && $log->target_id) {
                $commentIds[] = $log->target_id;
            }
        }

        $postTitles = BlogPost::whereIn('id', $postIds)->pluck('title', 'id');
        $comments = Comment::with('post:id,title')->whereIn('id', $commentIds)->get();
        $commentPostTitles = $comments->mapWithKeys(function ($comment) {
            return [$comment->id => $comment->post?->title];
        });

        $items = array_map(function ($log) use ($postTitles, $commentPostTitles) {
            $targetTitle = null;
            if ($log->target_type === BlogPost::class) {
                $targetTitle = $postTitles[$log->target_id] ?? null;
            } elseif ($log->target_type === Comment::class) {
                $targetTitle = $commentPostTitles[$log->target_id] ?? null;
            }
            $log->target_title = $targetTitle;
            return $log;
        }, $items);

        return response()->json([
            'logs' => $items,
            'totalPages' => $logs->lastPage(),
            'currentPage' => $logs->currentPage(),
            'total' => $logs->total(),
        ]);
    }
}
