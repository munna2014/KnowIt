<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogPostController extends Controller
{
    public function index(Request $request)
    {
        $query = BlogPost::with('user:id,name,first_name,last_name,avatar_url,avatar_path,bio')
                         ->withCount([
                             'comments as comments_count' => function ($query) {
                                 $query->where('status', 'approved');
                             },
                             'postLikes'
                         ])
                         ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            if ($request->status !== 'published') {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            $query->published();
        } else {
            // Default to published posts for public access
            $query->published();
        }

        // Filter by user if provided (for "My Blogs")
        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // Search functionality
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('content', 'like', "%{$search}%")
                  ->orWhere('excerpt', 'like', "%{$search}%");
            });
        }

        // Filter by category
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $posts = $query->paginate(12);

        return response()->json([
            'posts' => $posts->items(),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'category' => ['nullable', 'string', 'max:100'],
            'featured_image' => ['nullable', 'image', 'max:5120'], // 5MB max
            'featured_image_url' => ['nullable', 'url'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'status' => ['required', 'in:draft,review'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $user = $request->user();
        
        $postData = [
            'user_id' => $user->id,
            'title' => $validated['title'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'] ?? null,
            'category' => $validated['category'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'status' => $validated['status'],
            'scheduled_at' => $validated['scheduled_at'] ?? null,
            'rejection_reason' => null,
        ];

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            $path = $request->file('featured_image')->store('blog-images', 'public');
            $postData['featured_image'] = $path;
        } elseif (!empty($validated['featured_image_url'])) {
            $postData['featured_image'] = $validated['featured_image_url'];
        }

        $post = BlogPost::create($postData);
        $post->load('user:id,name,first_name,last_name,avatar_url,avatar_path,bio');

        return response()->json([
            'message' => 'Blog post created successfully!',
            'post' => $post,
        ], 201);
    }

    public function show(BlogPost $blogPost, Request $request)
    {
        if ($blogPost->status !== 'published') {
            $user = $request->user() ?? auth('sanctum')->user();
            $isAdmin = $user && $user->role === 'admin';
            $isOwner = $user && $blogPost->user_id === $user->id;

            if (!$isAdmin && !$isOwner) {
                return response()->json(['message' => 'Not found'], 404);
            }
        }

        $blogPost->load('user:id,name,first_name,last_name,avatar_url,avatar_path,bio');
        $blogPost->loadCount([
            'comments as comments_count' => function ($query) {
                $query->where('status', 'approved');
            },
            'postLikes'
        ]);
        
        // Increment view count
        $blogPost->increment('views_count');

        return response()->json([
            'post' => $blogPost,
        ]);
    }

    public function edit($id, Request $request)
    {
        $blogPost = BlogPost::findOrFail($id);
        
        // Check if user owns the post
        if ($blogPost->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $blogPost->load('user:id,name,first_name,last_name,avatar_url,avatar_path,bio');

        return response()->json([
            'post' => $blogPost,
        ]);
    }

    public function update(Request $request, $id)
    {
        $blogPost = BlogPost::findOrFail($id);
        
        // Check if user owns the post
        if ($blogPost->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'category' => ['nullable', 'string', 'max:100'],
            'featured_image' => ['nullable', 'image', 'max:5120'],
            'featured_image_url' => ['nullable', 'url'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
            'status' => ['required', 'in:draft,review,archived'],
            'scheduled_at' => ['nullable', 'date'],
        ]);

        $updateData = [
            'title' => $validated['title'],
            'content' => $validated['content'],
            'excerpt' => $validated['excerpt'] ?? null,
            'category' => $validated['category'] ?? null,
            'tags' => $validated['tags'] ?? null,
            'status' => $validated['status'],
            'scheduled_at' => $validated['scheduled_at'] ?? null,
        ];

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            // Delete old image if it exists and is stored locally
            if ($blogPost->featured_image && !filter_var($blogPost->featured_image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($blogPost->featured_image);
            }
            
            $path = $request->file('featured_image')->store('blog-images', 'public');
            $updateData['featured_image'] = $path;
        } elseif (!empty($validated['featured_image_url'])) {
            // Delete old local image if switching to URL
            if ($blogPost->featured_image && !filter_var($blogPost->featured_image, FILTER_VALIDATE_URL)) {
                Storage::disk('public')->delete($blogPost->featured_image);
            }
            $updateData['featured_image'] = $validated['featured_image_url'];
        }

        if ($blogPost->status === 'published' && $validated['status'] !== 'published') {
            $updateData['published_at'] = null;
        }
        if (in_array($validated['status'], ['draft', 'review'], true)) {
            $updateData['rejection_reason'] = null;
            $updateData['scheduled_at'] = $validated['scheduled_at'] ?? null;
        }

        $blogPost->update($updateData);
        $blogPost->load('user:id,name,first_name,last_name,avatar_url,avatar_path,bio');

        return response()->json([
            'message' => 'Blog post updated successfully!',
            'post' => $blogPost,
        ]);
    }

    public function destroy($id, Request $request)
    {
        $blogPost = BlogPost::findOrFail($id);
        
        // Check if user owns the post
        if ($blogPost->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete featured image if it's stored locally
        if ($blogPost->featured_image && !filter_var($blogPost->featured_image, FILTER_VALIDATE_URL)) {
            Storage::disk('public')->delete($blogPost->featured_image);
        }

        $blogPost->delete();

        return response()->json([
            'message' => 'Blog post deleted successfully!',
        ]);
    }

    public function myPosts(Request $request)
    {
        $query = BlogPost::where('user_id', $request->user()->id)
                         ->withCount([
                             'comments as comments_count' => function ($query) {
                                 $query->where('status', 'approved');
                             },
                             'postLikes'
                         ])
                         ->orderBy('created_at', 'desc');

        // Filter by status if provided
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $posts = $query->paginate(12);

        return response()->json([
            'posts' => $posts->items(),
            'pagination' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }
}
