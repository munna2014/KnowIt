<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class SimpleAdminController extends Controller
{
    public function login(Request $request)
    {
        try {
            // Basic validation
            if (!$request->has('email') || !$request->has('password')) {
                return response()->json(['message' => 'Email and password required'], 400);
            }

            // Find user
            $user = User::where('email', $request->email)->first();
            
            if (!$user) {
                return response()->json(['message' => 'User not found'], 404);
            }

            // Check password
            if (!Hash::check($request->password, $user->password)) {
                return response()->json(['message' => 'Invalid password'], 401);
            }

            // Check role
            if ($user->role !== 'admin') {
                return response()->json(['message' => 'Not an admin'], 403);
            }

            if ($user->status === 'banned') {
                return response()->json(['message' => 'You have been banned from this server.'], 403);
            }

            // Create token
            $token = $user->createToken('admin')->plainTextToken;

            return response()->json([
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Server error: ' . $e->getMessage()
            ], 500);
        }
    }
}
