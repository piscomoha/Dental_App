<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = ['target_role', 'message', 'is_read'];
    
    protected $casts = [
        'is_read' => 'boolean',
    ];
}
