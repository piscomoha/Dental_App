<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use Illuminate\Http\Request;

class FactureController extends Controller
{
    public function index(){ return Facture::with('consultation','paiements')->get(); }
    public function store(Request $r){ return Facture::create($r->all()); }
    public function show($id){ return Facture::with('consultation','paiements')->findOrFail($id); }
    public function update(Request $r,$id){ $f=Facture::findOrFail($id); $f->update($r->all()); return $f; }
    public function destroy($id){ Facture::findOrFail($id)->delete(); return response()->json(null,204); }
}