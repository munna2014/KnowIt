<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Report;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
    }

    /**
     * Report a blog post
     */
    public function store(Request $request, BlogPost $blogPost)
    {
        // Users cannot report their own posts
        if ($blogPost->user_id === $request->user()->id) {
            return response()->json([
                'message' => 'You cannot report your own post.'
            ], 403);
        }

        // Check if user already reported this post
        $existingReport = Report::where('reporter_id', $request->user()->id)
            ->where('blog_post_id', $blogPost->id)
            ->first();

        if ($existingReport) {
            return response()->json([
                'message' => 'You have already reported this post.'
            ], 409);
        }

        $validated = $request->validate([
            'reason' => [
                'required',
                'in:spam,harassment,hate_speech,inappropriate_content,copyright_violation,misinformation,violence,other'
            ],
            'description' => ['nullable', 'string', 'max:1000'],
        ]);

        $report = Report::create([
            'reporter_id' => $request->user()->id,
            'reported_user_id' => $blogPost->user_id,
            'blog_post_id' => $blogPost->id,
            'reason' => $validated['reason'],
            'description' => $validated['description'],
        ]);

        return response()->json([
            'message' => 'Report submitted successfully. Our team will review it shortly.',
            'report' => $report->load(['reporter:id,name', 'reportedUser:id,name', 'blogPost:id,title,slug'])
        ], 201);
    }

    /**
     * Get user's reports
     */
    public function index(Request $request)
    {
        $reports = Report::with([
                'reportedUser:id,name,avatar_url',
                'blogPost:id,title,slug',
                'reviewer:id,name'
            ])
            ->where('reporter_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->paginate(10);

        return response()->json([
            'reports' => $reports->items(),
            'totalPages' => $reports->lastPage(),
            'currentPage' => $reports->currentPage(),
            'total' => $reports->total()
        ]);
    }
}