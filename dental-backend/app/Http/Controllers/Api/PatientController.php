<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePatientRequest;
use App\Http\Requests\UpdatePatientRequest;
use App\Models\Patient;
use Illuminate\Http\Response;

class PatientController extends Controller
{
    /**
     * Display a listing of patients
     */
    public function index()
    {
        return response()->json(Patient::all(), Response::HTTP_OK);
    }

    /**
     * Store a newly created patient
     */
    public function store(StorePatientRequest $request)
    {
        try {
            $validated = $request->sanitized();
            $patient = Patient::create($validated);
            return response()->json($patient, Response::HTTP_CREATED);
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Erreur lors de la création du patient'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Display the specified patient
     */
    public function show($id)
    {
        try {
            $patient = Patient::with('rendezVous.consultation.traitements')->findOrFail($id);
            return response()->json($patient, Response::HTTP_OK);
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Patient non trouvé'],
                Response::HTTP_NOT_FOUND
            );
        }
    }

    /**
     * Update the specified patient
     */
    public function update(UpdatePatientRequest $request, $id)
    {
        try {
            $patient = Patient::findOrFail($id);
            $validated = $request->sanitized();
            $patient->update($validated);
            return response()->json($patient, Response::HTTP_OK);
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Erreur lors de la mise à jour du patient'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Remove the specified patient
     */
    public function destroy($id)
    {
        try {
            Patient::findOrFail($id)->delete();
            return response()->json(null, Response::HTTP_NO_CONTENT);
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Erreur lors de la suppression du patient'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}