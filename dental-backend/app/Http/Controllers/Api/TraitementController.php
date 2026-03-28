<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTraitementRequest;
use App\Http\Requests\UpdateTraitementRequest;
use App\Models\Traitement;
use Illuminate\Http\Response;

class TraitementController extends Controller
{
    /**
     * Display a listing of treatments
     */
    public function index()
    {
        return response()->json(
            Traitement::with(['consultation.rendez_vous.patient', 'patient'])->get(),
            Response::HTTP_OK
        );
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreTraitementRequest $request)
    {
        try {
            $validated = $request->sanitized();
            $traitement = Traitement::create($validated);
            
            return response()->json(
                $traitement->load(['consultation.rendez_vous.patient', 'patient']),
                Response::HTTP_CREATED
            );
        } catch (\Throwable $e) {
            \Log::error('Traitement creation error: ' . $e->getMessage());
            return response()->json(
                ['error' => 'Erreur lors de la création du traitement: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        try {
            $traitement = Traitement::with(['consultation.rendez_vous.patient', 'patient'])->findOrFail($id);
            return response()->json($traitement, Response::HTTP_OK);
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Traitement non trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateTraitementRequest $request, $id)
    {
        try {
            $traitement = Traitement::findOrFail($id);
            $validated = $request->sanitized();
            $traitement->update($validated);
            
            return response()->json(
                $traitement->load(['consultation.rendez_vous.patient', 'patient']),
                Response::HTTP_OK
            );
        } catch (\Throwable $e) {
            \Log::error('Traitement update error: ' . $e->getMessage());
            return response()->json(
                ['error' => 'Erreur lors de la mise à jour du traitement: ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            Traitement::findOrFail($id)->delete();
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Erreur lors de la suppression du traitement'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}