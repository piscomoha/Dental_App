<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Devis extends Model
{
    protected $fillable = ['date_devis','description','montant_estime','consultation_id'];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }
}
