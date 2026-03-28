<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Consultation;
use Illuminate\Http\Request;

class ConsultationController extends Controller
{
    public function index()
    {
        return Consultation::with('traitements','ordonnances','facture.paiements')->get();
    }

    public function store(Request $r){ return Consultation::create($r->all()); }
    public function show($id){ return Consultation::with('traitements','ordonnances','facture.paiements')->findOrFail($id); }
    public function update(Request $r,$id){ $c=Consultation::findOrFail($id); $c->update($r->all()); return $c; }
    public function destroy($id){ Consultation::findOrFail($id)->delete(); return response()->json(null,204); }
}