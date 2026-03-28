<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $role = $request->query('role');
        $query = Notification::query()->orderBy('created_at', 'desc');
        
        if ($role) {
            $query->where('target_role', $role);
        }

        return $query->get();
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'target_role' => 'required|string',
            'message' => 'required|string',
        ]);

        return Notification::create($validated);
    }

    public function markAsRead($id)
    {
        $notification = Notification::findOrFail($id);
        $notification->update(['is_read' => true]);
        return $notification;
    }

    public function markAllAsRead(Request $request)
    {
        $role = $request->query('role');
        $query = Notification::where('is_read', false);
        if ($role) {
            $query->where('target_role', $role);
        }
        $query->update(['is_read' => true]);
        return response()->json(['success' => true]);
    }
}
