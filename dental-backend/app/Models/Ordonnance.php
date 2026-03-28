<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ordonnance extends Model
{
    protected $fillable = ['date_ordonnance','medicaments','instructions','consultation_id'];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
