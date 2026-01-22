<?php

namespace App\Http\Controllers;

use App\Models\AuditLog;
use App\Models\BlogPost;
use App\Models\Report;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Http\Request;

class AdminReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    /**
     * Get all reports with filters
     */
    public function index(Request $request)
    {
        $query = Report::with([
            'reporter:id,name,email,avatar_url',
            'reportedUser:id,name,email,avatar_url,status',
            'blogPost:id,title,slug,status',
            'reviewer:id,name'
        ]);

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Filter by reason
        if ($request->has('reason') && $request->reason) {
            $query->where('reason', $request->reason);
        }

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->whereHas('reporter', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('reportedUser', function ($userQuery) use ($search) {
                    $userQuery->where('name', 'like', "%{$search}%")
                             ->orWhere('email', 'like', "%{$search}%");
                })
                ->orWhereHas('blogPost', function ($postQuery) use ($search) {
                    $postQuery->where('title', 'like', "%{$search}%");
                })
                ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $reports = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('limit', 15));

        return response()->json([
            'reports' => $reports->items(),
            'totalPages' => $reports->lastPage(),
            'currentPage' => $reports->currentPage(),
            'total' => $reports->total()
        ]);
    }

    /**
     * Take action on a report
     */
    public function takeAction(Request $request, Report $report)
    {
        $validated = $request->validate([
            'action' => ['required', 'in:dismiss,warning,delete_post,ban_user'],
            'admin_notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $action = $validated['action'];
        $adminNotes = $validated['admin_notes'];

        // Update report status
        $report->update([
            'status' => 'reviewed',
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
            'admin_notes' => $adminNotes,
        ]);

        $message = '';
        $adminAction = 'none';

        switch ($action) {
            case 'dismiss':
                $report->update(['status' => 'dismissed']);
                $message = 'Report dismissed successfully.';
                break;

            case 'warning':
                $adminAction = 'warning';
                $message = 'Warning issued to user.';
                break;

            case 'delete_post':
                $blogPost = $report->blogPost;
                if ($blogPost) {
                    $blogPost->update(['status' => 'archived']);
                    $adminAction = 'post_deleted';
                    $message = 'Post has been deleted.';
                }
                break;

            case 'ban_user':
                $reportedUser = $report->reportedUser;
                if ($reportedUser) {
                    $reportedUser->update(['status' => 'banned']);
                    $adminAction = 'user_banned';
                    $message = 'User has been banned.';
                }
                break;
        }

        $report->update([
            'admin_action' => $adminAction,
            'status' => 'resolved'
        ]);

        $this->notifyReportedUser($report, $action, $adminNotes);
        $this->notifyReporter($report, $action, $adminNotes);

        // Log admin action
        $this->logAdminAction($request, 'report_action', Report::class, $report->id, [
            'action' => $action,
            'reported_user_id' => $report->reported_user_id,
            'blog_post_id' => $report->blog_post_id,
            'admin_notes' => $adminNotes
        ]);

        return response()->json([
            'message' => $message,
            'report' => $report->load([
                'reporter:id,name,email',
                'reportedUser:id,name,email,status',
                'blogPost:id,title,slug,status',
                'reviewer:id,name'
            ])
        ]);
    }

    /**
     * Get report statistics
     */
    public function stats()
    {
        $stats = [
            'total_reports' => Report::count(),
            'pending_reports' => Report::where('status', 'pending')->count(),
            'resolved_reports' => Report::where('status', 'resolved')->count(),
            'dismissed_reports' => Report::where('status', 'dismissed')->count(),
            'reports_by_reason' => Report::selectRaw('reason, COUNT(*) as count')
                ->groupBy('reason')
                ->pluck('count', 'reason'),
            'recent_reports' => Report::with([
                    'reporter:id,name',
                    'reportedUser:id,name',
                    'blogPost:id,title,slug'
                ])
                ->where('status', 'pending')
                ->orderBy('created_at', 'desc')
                ->limit(5)
                ->get()
        ];

        return response()->json($stats);
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

    private function notifyReportedUser(Report $report, string $action, ?string $adminNotes = null): void
    {
        if (!$report->reported_user_id) {
            return;
        }

        $postSlug = $report->blogPost?->slug;
        $titleMap = [
            'dismiss' => 'Report dismissed',
            'warning' => 'Warning issued',
            'delete_post' => 'Post removed',
            'ban_user' => 'Account action taken'
        ];

        $messageMap = [
            'dismiss' => 'A report against your account was dismissed after review.',
            'warning' => 'An admin issued a warning related to a reported post or account.',
            'delete_post' => 'Your reported post was removed by an admin.',
            'ban_user' => 'Your account was banned by an admin.'
        ];

        $title = $titleMap[$action] ?? 'Report update';
        $message = $messageMap[$action] ?? 'An admin reviewed a report involving your account.';

        if ($adminNotes) {
            $message .= " Note: {$adminNotes}";
        }

        Notification::create([
            'user_id' => $report->reported_user_id,
            'type' => 'report_action',
            'title' => $title,
            'message' => $message,
            'data' => [
                'report_id' => $report->id,
                'action' => $action,
                'post_id' => $report->blog_post_id,
                'post_slug' => $postSlug
            ]
        ]);
    }

    private function notifyReporter(Report $report, string $action, ?string $adminNotes = null): void
    {
        if (!$report->reporter_id) {
            return;
        }

        $postSlug = $report->blogPost?->slug;
        $titleMap = [
            'dismiss' => 'Report dismissed',
            'warning' => 'Report reviewed',
            'delete_post' => 'Report resolved',
            'ban_user' => 'Report resolved'
        ];

        $messageMap = [
            'dismiss' => 'Your report was reviewed and dismissed.',
            'warning' => 'Your report was reviewed and a warning was issued.',
            'delete_post' => 'Your report was reviewed and the post was removed.',
            'ban_user' => 'Your report was reviewed and action was taken against the account.'
        ];

        $title = $titleMap[$action] ?? 'Report update';
        $message = $messageMap[$action] ?? 'Your report was reviewed by an admin.';

        if ($adminNotes) {
            $message .= " Note: {$adminNotes}";
        }

        Notification::create([
            'user_id' => $report->reporter_id,
            'type' => 'report_update',
            'title' => $title,
            'message' => $message,
            'data' => [
                'report_id' => $report->id,
                'action' => $action,
                'post_id' => $report->blog_post_id,
                'post_slug' => $postSlug
            ]
        ]);
    }
}
