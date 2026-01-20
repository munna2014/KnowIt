<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class AdminCategoryController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    /**
     * Get all categories
     */
    public function index()
    {
        $categories = Category::withCount('blogPosts as posts_count')
            ->orderBy('name')
            ->get();

        return response()->json([
            'categories' => $categories
        ]);
    }

    /**
     * Create category
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:categories',
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7'
        ]);

        $category = Category::create($request->only(['name', 'description', 'color']));

        return response()->json([
            'message' => 'Category created successfully',
            'category' => $category
        ], 201);
    }

    /**
     * Update category
     */
    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);
        
        $request->validate([
            'name' => 'sometimes|string|max:255|unique:categories,name,' . $id,
            'description' => 'nullable|string|max:500',
            'color' => 'nullable|string|max:7'
        ]);

        $category->update($request->only(['name', 'description', 'color']));

        return response()->json([
            'message' => 'Category updated successfully',
            'category' => $category
        ]);
    }

    /**
     * Delete category
     */
    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        
        // Check if category has posts
        if ($category->blogPosts()->count() > 0) {
            return response()->json([
                'message' => 'Cannot delete category with existing posts'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }
}