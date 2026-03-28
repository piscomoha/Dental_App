<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateRendezVousRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'date_rdv' => 'sometimes|required|date_format:Y-m-d|after_or_equal:today',
            'heure_rdv' => 'sometimes|required|date_format:H:i',
            'statut' => 'sometimes|required|in:En attente,Confirmé,Annulé,Terminé',
            'patient_id' => 'sometimes|required|exists:patients,id|integer|min:1',
            'dentiste_id' => 'nullable|exists:dentistes,id|integer|min:1',
            'secretaire_id' => 'nullable|exists:secretaires,id|integer|min:1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'date_rdv.required' => 'La date du rendez-vous est requise.',
            'date_rdv.date' => 'La date doit être valide.',
            'date_rdv.after_or_equal' => 'La date doit être à partir d\'aujourd\'hui.',
            'heure_rdv.required' => 'L\'heure est requise.',
            'heure_rdv.regex' => 'Format d\'heure invalide (HH:MM).',
            'statut.required' => 'Le statut est requis.',
            'statut.in' => 'Statut invalide.',
            'patient_id.required' => 'Le patient est requis.',
            'patient_id.exists' => 'Le patient sélectionné n\'existe pas.',
            'patient_id.integer' => 'L\'ID patient doit être un nombre.',
            'dentiste_id.exists' => 'Le dentiste sélectionné n\'existe pas.',
            'secretaire_id.exists' => 'La secrétaire sélectionnée n\'existe pas.',
        ];
    }

    /**
     * Sanitize inputs
     */
    public function sanitized()
    {
        return [
            'date_rdv' => $this->input('date_rdv'),
            'heure_rdv' => trim($this->input('heure_rdv')),
            'statut' => trim($this->input('statut')),
            'patient_id' => $this->input('patient_id') ? (int) $this->input('patient_id') : null,
            'dentiste_id' => $this->input('dentiste_id') ? (int) $this->input('dentiste_id') : null,
            'secretaire_id' => $this->input('secretaire_id') ? (int) $this->input('secretaire_id') : null,
        ];
    }
}
