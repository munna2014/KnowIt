<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    use HasFactory;

    protected $fillable = [
        'reporter_id',
        'reported_user_id',
        'blog_post_id',
        'reason',
        'description',
        'status',
        'admin_action',
        'admin_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'reviewed_at' => 'datetime',
    ];

    /**
     * The user who made the report
     */
    public function reporter()
    {
        return $this->belongsTo(User::class, 'reporter_id');
    }

    /**
     * The user being reported
     */
    public function reportedUser()
    {
        return $this->belongsTo(User::class, 'reported_user_id');
    }

    /**
     * The blog post being reported
     */
    public function blogPost()
    {
        return $this->belongsTo(BlogPost::class, 'blog_post_id');
    }

    /**
     * The admin who reviewed the report
     */
    public function reviewer()
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }

    /**
     * Get human-readable reason
     */
    public function getReasonLabelAttribute()
    {
        $reasons = [
            'spam' => 'Spam',
            'harassment' => 'Harassment',
            'hate_speech' => 'Hate Speech',
            'inappropriate_content' => 'Inappropriate Content',
            'copyright_violation' => 'Copyright Violation',
            'misinformation' => 'Misinformation',
            'violence' => 'Violence',
            'other' => 'Other',
        ];

        return $reasons[$this->reason] ?? $this->reason;
    }

    /**
     * Get human-readable admin action
     */
    public function getAdminActionLabelAttribute()
    {
        $actions = [
            'none' => 'No Action',
            'warning' => 'Warning Issued',
            'post_deleted' => 'Post Deleted',
            'user_banned' => 'User Banned',
        ];

        return $actions[$this->admin_action] ?? $this->admin_action;
    }
}