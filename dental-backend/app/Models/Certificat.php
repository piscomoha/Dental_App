<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Certificat extends Model
{
    protected $fillable = ['date_certificat','contenu','patient_name','consultation_id'];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
