<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Facture extends Model
{
    protected $fillable = ['date_facture','montant_total','consultation_id'];

    public function consultation()
    {
        return $this->belongsTo(Consultation::class);
    }

    public function paiements()
    {
        return $this->hasMany(Paiement::class);
    }
}
