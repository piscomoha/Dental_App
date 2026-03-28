<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Dentiste;
use Illuminate\Http\Request;

class DentisteController extends Controller
{
    public function index() { return Dentiste::all(); }
    public function store(Request $r) { return Dentiste::create($r->all()); }
    public function show($id) { return Dentiste::findOrFail($id); }
    public function update(Request $r, $id) { $d=Dentiste::findOrFail($id); $d->update($r->all()); return $d; }
    public function destroy($id){ Dentiste::findOrFail($id)->delete(); return response()->json(null,204); }
}
