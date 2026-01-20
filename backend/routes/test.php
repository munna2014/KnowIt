<?php

use App\Models\User;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;

Route::get('/test-admin', function () {
    try {
        $user = User::where('email', 'admin@knowit.com')->first();
        
        if ($user) {
            return response()->json([
                'success' => true,
                'message' => 'Admin user found',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status
                ]
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Admin user not found'
            ]);
        }
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ]);
    }
});

Route::post('/test-login', function (Request $request) {
    try {
        $email = $request->input('email', 'admin@knowit.com');
        $password = $request->input('password', 'admin123');
        
        $user = User::where('email', $email)->first();
        
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'User not found']);
        }
        
        $passwordCheck = Hash::check($password, $user->password);
        
        if (!$passwordCheck) {
            return response()->json(['success' => false, 'message' => 'Password incorrect']);
        }
        
        if ($user->role !== 'admin') {
            return response()->json(['success' => false, 'message' => 'Not admin']);
        }
        
        // Try to create token
        $token = $user->createToken('test-token')->plainTextToken;
        
        return response()->json([
            'success' => true,
            'user_found' => true,
            'password_check' => $passwordCheck,
            'user_role' => $user->role,
            'user_status' => $user->status,
            'token' => $token
        ]);
    } catch (Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Error: ' . $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
    }
});