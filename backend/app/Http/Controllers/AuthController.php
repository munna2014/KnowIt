<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $validated = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'first_name' => ['nullable', 'string', 'max:255'],
            'last_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:25', 'unique:users,phone'],
            'birthday' => ['nullable', 'date'],
            'gender' => ['nullable', 'string', 'max:50'],
            'password' => ['required', 'string', 'min:6', 'confirmed'],
        ]);

        $name = $validated['name'] ?? trim(($validated['first_name'] ?? '').' '.($validated['last_name'] ?? ''));
        if ($name === '') {
            $name = $validated['email'];
        }

        $user = User::create([
            'name' => $name,
            'first_name' => $validated['first_name'] ?? null,
            'last_name' => $validated['last_name'] ?? null,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => $validated['password'],
            'birthday' => $validated['birthday'] ?? null,
            'gender' => $validated['gender'] ?? null,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => ['nullable', 'email', 'max:255', 'required_without:identifier'],
            'identifier' => ['nullable', 'string', 'max:255', 'required_without:email'],
            'password' => ['required', 'string'],
        ]);

        $identifier = trim($validated['email'] ?? $validated['identifier'] ?? '');
        $user = User::query()
            ->where(function ($query) use ($identifier) {
                if (filter_var($identifier, FILTER_VALIDATE_EMAIL)) {
                    $query->where('email', $identifier);
                } else {
                    $query->where('phone', $identifier)
                        ->orWhere('email', $identifier);
                }
            })
            ->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out.',
        ]);
    }

    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ]);
    }
}
