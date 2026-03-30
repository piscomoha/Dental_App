<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Patient extends Model
{
    protected $fillable = ['nom','prenom','telephone','date_naissance','adresse','sexe','ville'];

    // relation m3a RendezVous
    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class);
    }
}
