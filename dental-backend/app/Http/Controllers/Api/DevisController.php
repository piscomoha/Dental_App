<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Devis;
use Illuminate\Http\Request;

class DevisController extends Controller
{
    public function index()
    {
        return Devis::with('consultation.rendezVous.patient')->get();
    }

    public function store(Request $r)
    {
        return Devis::create($r->all());
    }

    public function show($id)
    {
        return Devis::with('consultation.rendezVous.patient')->findOrFail($id);
    }

    public function update(Request $r, $id)
    {
        $d = Devis::findOrFail($id);
        $d->update($r->all());
        return $d;
    }

    public function destroy($id)
    {
        Devis::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
