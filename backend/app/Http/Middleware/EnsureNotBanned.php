<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class EnsureNotBanned
{
    public function handle(Request $request, Closure $next)
    {
        $user = $request->user();
        if ($user && $user->status === 'banned') {
            return response()->json([
                'message' => 'You have been banned from this server.'
            ], 403);
        }

        return $next($request);
    }
}
