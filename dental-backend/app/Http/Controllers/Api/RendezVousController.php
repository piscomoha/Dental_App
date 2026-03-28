<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreRendezVousRequest;
use App\Http\Requests\UpdateRendezVousRequest;
use App\Models\RendezVous;
use Illuminate\Http\Response;

class RendezVousController extends Controller
{
    /**
     * Display a listing of appointments
     */
    public function index()
    {
        return response()->json(
            RendezVous::with('patient','dentiste','secretaire','consultation.traitements','consultation.ordonnances','consultation.facture.paiements')->get(),
            Response::HTTP_OK
        );
    }

    /**
     * Store a newly created appointment
     */
    public function store(StoreRendezVousRequest $request)
    {
        try {
            $validated = $request->sanitized();
            $rdv = RendezVous::create($validated);
            return response()->json(
                $rdv->load('patient','dentiste','secretaire','consultation.traitements','consultation.ordonnances','consultation.facture.paiements'),
                Response::HTTP_CREATED
            );
        } catch (\Throwable $e) {
            \Log::error('RendezVous creation error: ' . $e->getMessage());
            return response()->json(
                ['error' => 'Erreur lors de la création du rendez-vous: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Display the specified appointment
     */
    public function show($id)
    {
        try {
            $rdv = RendezVous::with('patient','dentiste','secretaire','consultation.traitements','consultation.ordonnances','consultation.facture.paiements')->findOrFail($id);
            return response()->json($rdv, Response::HTTP_OK);
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Rendez-vous non trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update the specified appointment
     */
    public function update(UpdateRendezVousRequest $request, $id)
    {
        try {
            $rdv = RendezVous::findOrFail($id);
            $validated = $request->sanitized();
            $rdv->update($validated);
            return response()->json(
                $rdv->load('patient','dentiste','secretaire','consultation.traitements','consultation.ordonnances','consultation.facture.paiements'),
                Response::HTTP_OK
            );
        } catch (\Throwable $e) {
            \Log::error('RendezVous update error: ' . $e->getMessage());
            return response()->json(
                ['error' => 'Erreur lors de la mise à jour du rendez-vous: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove the specified appointment
     */
    public function destroy($id)
    {
        try {
            RendezVous::findOrFail($id)->delete();
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Erreur lors de la suppression du rendez-vous'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}