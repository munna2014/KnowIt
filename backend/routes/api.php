<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BlogPostController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Public blog routes
Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{blogPost:slug}', [BlogPostController::class, 'show']);

Route::middleware('auth:sanctum')->group(function () {
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
});
