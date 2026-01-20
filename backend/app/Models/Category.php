<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'color'
    ];

    /**
     * Get the blog posts for the category.
     */
    public function blogPosts()
    {
        return $this->hasMany(BlogPost::class, 'category', 'name');
    }
}