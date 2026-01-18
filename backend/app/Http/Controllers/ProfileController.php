<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255', 'unique:users,email,'.$user->id],
            'phone' => ['nullable', 'string', 'max:25', 'unique:users,phone,'.$user->id],
            'gender' => ['nullable', 'string', 'max:50'],
            'birthday' => ['nullable', 'date'],
            'avatar_url' => ['nullable', 'url'],
        ]);

        $name = $validated['name'] ?? trim(($validated['first_name'] ?? '').' '.($validated['last_name'] ?? ''));
        if ($name === '') {
            $name = $user->name;
        }

        $user->fill([
            'name' => $name,
            'first_name' => $validated['first_name'] ?? $user->first_name,
            'last_name' => $validated['last_name'] ?? $user->last_name,
            'email' => $validated['email'] ?? $user->email,
            'phone' => $validated['phone'] ?? $user->phone,
            'gender' => $validated['gender'] ?? $user->gender,
            'birthday' => $validated['birthday'] ?? $user->birthday,
        ]);

        // Handle avatar URL input (if user pastes a URL)
        if (array_key_exists('avatar_url', $validated) && $validated['avatar_url']) {
            // If user provides an external URL, clear the local file
            if ($user->avatar_path) {
                Storage::disk('public')->delete($user->avatar_path);
                $user->avatar_path = null;
            }
            $user->avatar_url = $validated['avatar_url'];
        }

        $user->save();

        return response()->json([
            'user' => $user,
        ]);
    }

    public function uploadAvatar(Request $request)
    {
        $validated = $request->validate([
            'avatar' => ['required', 'image', 'max:5120'],
        ]);

        $user = $request->user();

        // Delete old avatar if exists
        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        // Store new avatar
        $path = $validated['avatar']->store('avatars', 'public');
        $user->avatar_path = $path;
        $user->avatar_url = null;
        $user->save();

        return response()->json([
            'user' => $user,
        ]);
    }

    public function removeAvatar(Request $request)
    {
        $user = $request->user();

        if ($user->avatar_path) {
            Storage::disk('public')->delete($user->avatar_path);
        }

        $user->avatar_path = null;
        $user->avatar_url = null;
        $user->save();

        return response()->json([
            'user' => $user,
        ]);
    }
}
