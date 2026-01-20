<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:sanctum');
        $this->middleware('admin');
    }

    /**
     * Get all settings
     */
    public function index()
    {
        $settings = Setting::pluck('value', 'key')->toArray();

        // Default settings if not set
        $defaultSettings = [
            'site_name' => 'KnowIt',
            'site_description' => 'A knowledge sharing platform',
            'site_url' => 'http://localhost:3000',
            'admin_email' => 'admin@knowit.com',
            'allow_registration' => true,
            'require_email_verification' => true,
            'enable_comments' => true,
            'auto_approve_comments' => false,
            'posts_per_page' => 10,
            'enable_notifications' => true,
            'maintenance_mode' => false
        ];

        $settings = array_merge($defaultSettings, $settings);

        // Convert string booleans to actual booleans
        foreach ($settings as $key => $value) {
            if ($value === 'true') $settings[$key] = true;
            if ($value === 'false') $settings[$key] = false;
            if (is_numeric($value)) $settings[$key] = (int) $value;
        }

        return response()->json([
            'settings' => $settings
        ]);
    }

    /**
     * Update settings
     */
    public function update(Request $request)
    {
        $request->validate([
            'site_name' => 'sometimes|string|max:255',
            'site_description' => 'sometimes|string|max:500',
            'site_url' => 'sometimes|url',
            'admin_email' => 'sometimes|email',
            'allow_registration' => 'sometimes|boolean',
            'require_email_verification' => 'sometimes|boolean',
            'enable_comments' => 'sometimes|boolean',
            'auto_approve_comments' => 'sometimes|boolean',
            'posts_per_page' => 'sometimes|integer|min:1|max:50',
            'enable_notifications' => 'sometimes|boolean',
            'maintenance_mode' => 'sometimes|boolean'
        ]);

        foreach ($request->all() as $key => $value) {
            Setting::updateOrCreate(
                ['key' => $key],
                ['value' => is_bool($value) ? ($value ? 'true' : 'false') : $value]
            );
        }

        return response()->json([
            'message' => 'Settings updated successfully'
        ]);
    }
}