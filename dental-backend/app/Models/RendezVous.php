<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RendezVous extends Model
{
    protected $fillable = ['date_rdv','heure_rdv','statut','patient_id','dentiste_id','secretaire_id'];

    public function patient()
    {
        return $this->belongsTo(Patient::class);
    }

    public function dentiste()
    {
        return $this->belongsTo(Dentiste::class);
    }

    public function secretaire()
    {
        return $this->belongsTo(Secretaire::class);
    }

    public function consultation()
    {
        return $this->hasOne(Consultation::class);
    }
}
