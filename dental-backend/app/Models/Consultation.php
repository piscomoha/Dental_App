<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Consultation extends Model
{
    protected $fillable = ['date_consultation','diagnostic','observation','rendez_vous_id'];

    public function rendezVous()
    {
        return $this->belongsTo(RendezVous::class);
    }

    public function traitements()
    {
        return $this->hasMany(Traitement::class);
    }

    public function ordonnances()
    {
        return $this->hasMany(Ordonnance::class);
    }

    public function facture()
    {
        return $this->hasOne(Facture::class);
    }
}