<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Certificat;
use Illuminate\Http\Request;

class CertificatController extends Controller
{
    public function index()
    {
        return Certificat::with('consultation')->get();
    }

    public function store(Request $r)
    {
        return Certificat::create($r->all());
    }

    public function show($id)
    {
        return Certificat::with('consultation')->findOrFail($id);
    }

    public function update(Request $r, $id)
    {
        $c = Certificat::findOrFail($id);
        $c->update($r->all());
        return $c;
    }

    public function destroy($id)
    {
        Certificat::findOrFail($id)->delete();
        return response()->json(null, 204);
    }
}
