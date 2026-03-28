<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Secretaire extends Model
{
    protected $fillable = ['nom','prenom','telephone','email'];

    public function rendezVous()
    {
        return $this->hasMany(RendezVous::class);
    }
}
