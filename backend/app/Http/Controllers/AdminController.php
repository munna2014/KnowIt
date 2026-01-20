<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\BlogPost;
use App\Models\Comment;
use App\Models\BlogPostLike;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function __construct()
    {
        // Only apply middleware to protected methods, not login
        $this->middleware(['auth:sanctum', 'admin'])->except(['login']);
    }

    /**
     * Admin login
     */
    public function login(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'password' => 'required',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json([
                    'message' => 'User not found'
                ], 404);
            }

            if (!Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'Invalid password'
                ], 401);
            }

            if ($user->role !== 'admin') {
                return response()->json([
                    'message' => 'Access denied. Admin privileges required.'
                ], 403);
            }

            // Delete existing tokens
            $user->tokens()->delete();

            // Create new token
            $token = $user->createToken('admin-token')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => $user,
                'message' => 'Login successful'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Login failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current admin user
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user()
        ]);
    }

    /**
     * Get dashboard statistics
     */
    public function getStats()
    {
        try {
            $totalUsers = User::count();
            $totalPosts = BlogPost::count();
            $totalComments = Comment::count();
            $totalLikes = BlogPostLike::count();

            $postsLast7Days = BlogPost::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(7))
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $postsLast4Weeks = BlogPost::selectRaw('YEARWEEK(created_at, 1) as week, COUNT(*) as count')
                ->where('created_at', '>=', now()->subWeeks(4))
                ->groupBy('week')
                ->orderBy('week')
                ->get();

            $topAuthors = User::where('role', 'user')->withCount([
                'blogPosts as posts_count' => function ($query) {
                    $query->where('status', 'published');
                }
            ])
                ->orderByDesc('posts_count')
                ->take(5)
                ->get(['id', 'name', 'email']);

            $commentActivity = Comment::selectRaw('DATE(created_at) as date, COUNT(*) as count')
                ->where('created_at', '>=', now()->subDays(14))
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            return response()->json([
                'totalUsers' => $totalUsers,
                'totalPosts' => $totalPosts,
                'totalComments' => $totalComments,
                'totalLikes' => $totalLikes,
                'postsPerDay' => $postsLast7Days,
                'postsPerWeek' => $postsLast4Weeks,
                'topAuthors' => $topAuthors,
                'commentActivity' => $commentActivity,
                'lastUpdated' => now()->toIso8601String(),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Error loading stats: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users with pagination and filters
     */
    public function getUsers(Request $request)
    {
        $query = User::query();

        // Search
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Add posts count
        $query->withCount('blogPosts as posts_count');

        $users = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('limit', 10));

        return response()->json([
            'users' => $users->items(),
            'totalPages' => $users->lastPage(),
            'currentPage' => $users->currentPage(),
            'total' => $users->total()
        ]);
    }

    /**
     * Update user
     */
    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $id,
            'role' => 'sometimes|in:user,admin',
            'status' => 'sometimes|in:active,banned,pending'
        ]);

        $user->update($request->only(['name', 'email', 'role', 'status']));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Ban user
     */
    public function banUser($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'banned']);

        return response()->json([
            'message' => 'User banned successfully'
        ]);
    }

    /**
     * Unban user
     */
    public function unbanUser($id)
    {
        $user = User::findOrFail($id);
        $user->update(['status' => 'active']);

        return response()->json([
            'message' => 'User unbanned successfully'
        ]);
    }

    /**
     * Delete user
     */
    public function deleteUser($id)
    {
        $user = User::findOrFail($id);
        
        // Don't allow deleting the current admin
        if ($user->id === Auth::id()) {
            return response()->json([
                'message' => 'Cannot delete your own account'
            ], 400);
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
