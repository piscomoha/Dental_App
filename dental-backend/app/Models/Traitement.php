<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Traitement extends Model
{
    protected $fillable = ['nom_traitement','description','prix','consultation_id','patient_id'];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
    
    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }
}
