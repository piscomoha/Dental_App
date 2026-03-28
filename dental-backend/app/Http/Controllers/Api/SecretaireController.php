<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Secretaire;
use Illuminate\Http\Request;

class SecretaireController extends Controller
{
    public function index() { return Secretaire::all(); }
    public function store(Request $r) { return Secretaire::create($r->all()); }
    public function show($id) { return Secretaire::findOrFail($id); }
    public function update(Request $r, $id) { $s=Secretaire::findOrFail($id); $s->update($r->all()); return $s; }
    public function destroy($id){ Secretaire::findOrFail($id)->delete(); return response()->json(null,204); }
}