<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Paiement;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    public function index(){ return Paiement::with('facture')->get(); }
    public function store(Request $r){ return Paiement::create($r->all()); }
    public function show($id){ return Paiement::with('facture')->findOrFail($id); }
    public function update(Request $r,$id){ $p=Paiement::findOrFail($id); $p->update($r->all()); return $p; }
    public function destroy($id){ Paiement::findOrFail($id)->delete(); return response()->json(null,204); }
}   