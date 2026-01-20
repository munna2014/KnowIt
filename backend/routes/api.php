<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BlogPostController;
use App\Http\Controllers\CommentController;
use App\Http\Controllers\BlogPostLikeController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AdminPostController;
use App\Http\Controllers\AdminCommentController;
use App\Http\Controllers\AdminCategoryController;
use App\Http\Controllers\AdminSettingsController;
use App\Http\Controllers\AdminAuditLogController;
use App\Http\Controllers\SimpleAdminController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public blog routes
Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{blogPost:slug}', [BlogPostController::class, 'show']);
Route::get('/blog-posts/{blogPost:slug}/comments', [CommentController::class, 'index']);

// Protected user routes
Route::middleware(['auth:sanctum', 'not_banned'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'removeAvatar']);
    
    // Protected blog routes - using ID for CRUD operations
    Route::get('/my-blog-posts', [BlogPostController::class, 'myPosts']);
    Route::post('/blog-posts', [BlogPostController::class, 'store']);
    Route::get('/blog-posts/{id}/edit', [BlogPostController::class, 'edit']); // For editing by ID
    Route::put('/blog-posts/{id}/update', [BlogPostController::class, 'update']); // Update by ID
    Route::delete('/blog-posts/{id}/delete', [BlogPostController::class, 'destroy']); // Delete by ID
    Route::post('/blog-posts/{blogPost:slug}/comments', [CommentController::class, 'store']);
    Route::put('/comments/{comment}', [CommentController::class, 'update']);
    Route::delete('/comments/{comment}', [CommentController::class, 'destroy']);
    Route::get('/blog-posts/{blogPost:slug}/like-status', [BlogPostLikeController::class, 'status']);
    Route::post('/blog-posts/{blogPost:slug}/like', [BlogPostLikeController::class, 'toggle']);
});

// Admin routes
Route::prefix('admin')->group(function () {
    // Simple admin login (no middleware)
    Route::post('/login', [SimpleAdminController::class, 'login']);
    
    // Protected admin routes
    Route::middleware(['auth:sanctum', 'admin'])->group(function () {
        // Admin user info
        Route::get('/me', [AdminController::class, 'me']);
        
        // Dashboard
        Route::get('/stats', [AdminController::class, 'getStats']);
        
        // User management
        Route::get('/users', [AdminController::class, 'getUsers']);
        Route::put('/users/{id}', [AdminController::class, 'updateUser']);
        Route::delete('/users/{id}', [AdminController::class, 'deleteUser']);
        Route::post('/users/{id}/ban', [AdminController::class, 'banUser']);
        Route::post('/users/{id}/unban', [AdminController::class, 'unbanUser']);
        
        // Post management
        Route::get('/posts', [AdminPostController::class, 'index']);
        Route::get('/posts/{id}', [AdminPostController::class, 'show']);
        Route::put('/posts/{id}', [AdminPostController::class, 'update']);
        Route::delete('/posts/{id}', [AdminPostController::class, 'destroy']);
        Route::post('/posts/{id}/publish', [AdminPostController::class, 'publish']);
        Route::post('/posts/{id}/unpublish', [AdminPostController::class, 'unpublish']);
        Route::post('/posts/{id}/approve', [AdminPostController::class, 'approve']);
        Route::post('/posts/{id}/reject', [AdminPostController::class, 'reject']);
        
        // Comment management
        Route::get('/comments', [AdminCommentController::class, 'index']);
        Route::post('/comments/{id}/approve', [AdminCommentController::class, 'approve']);
        Route::post('/comments/{id}/reject', [AdminCommentController::class, 'reject']);
        Route::post('/comments/{id}/hide', [AdminCommentController::class, 'hide']);
        Route::post('/comments/bulk', [AdminCommentController::class, 'bulk']);
        Route::delete('/comments/{id}', [AdminCommentController::class, 'destroy']);
        
        // Category management
        Route::get('/categories', [AdminCategoryController::class, 'index']);
        Route::post('/categories', [AdminCategoryController::class, 'store']);
        Route::put('/categories/{id}', [AdminCategoryController::class, 'update']);
        Route::delete('/categories/{id}', [AdminCategoryController::class, 'destroy']);
        
        // Settings
        Route::get('/settings', [AdminSettingsController::class, 'index']);
        Route::put('/settings', [AdminSettingsController::class, 'update']);

        // Audit logs
        Route::get('/audit-logs', [AdminAuditLogController::class, 'index']);
    });
});
