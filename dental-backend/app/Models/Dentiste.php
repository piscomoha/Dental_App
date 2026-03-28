<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Dentiste extends Model
{
    protected $fillable = ['nom','prenom','specialite','telephone'];

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class);
    }
}