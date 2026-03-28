<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ordonnance;
use Illuminate\Http\Request;

class OrdonnanceController extends Controller
{
    public function index(){ return Ordonnance::with('consultation')->get(); }
    public function store(Request $r){ return Ordonnance::create($r->all()); }
    public function show($id){ return Ordonnance::with('consultation')->findOrFail($id); }
    public function update(Request $r,$id){ $o=Ordonnance::findOrFail($id); $o->update($r->all()); return $o; }
    public function destroy($id){ Ordonnance::findOrFail($id)->delete(); return response()->json(null,204); }
}