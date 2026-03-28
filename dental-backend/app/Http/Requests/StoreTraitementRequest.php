<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreTraitementRequest extends FormRequest
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
            'nom_traitement' => 'required|string|max:255',
            'description' => 'nullable|string|max:2000',
            'prix' => 'required|numeric|min:0|max:999999.99',
            'consultation_id' => 'nullable|exists:consultations,id|integer|min:1',
            'patient_id' => 'nullable|exists:patients,id|integer|min:1',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nom_traitement.required' => 'Le nom du traitement est requis.',
            'nom_traitement.string' => 'Le nom du traitement doit être un texte.',
            'nom_traitement.max' => 'Le nom du traitement ne doit pas dépasser 255 caractères.',
            'nom_traitement.regex' => 'Le nom du traitement contient des caractères invalides.',
            'description.string' => 'La description doit être un texte.',
            'description.max' => 'La description ne doit pas dépasser 2000 caractères.',
            'description.regex' => 'La description contient des caractères invalides.',
            'prix.required' => 'Le prix est requis.',
            'prix.numeric' => 'Le prix doit être un nombre.',
            'prix.min' => 'Le prix doit être positif.',
            'prix.max' => 'Le prix ne doit pas dépasser 999999.99 MAD.',
            'prix.regex' => 'Format de prix invalide (ex: 199.99).',
            'consultation_id.exists' => 'La consultation sélectionnée n\'existe pas.',
            'consultation_id.integer' => 'L\'ID du traitement doit être un nombre entier.',
            'consultation_id.min' => 'L\'ID ne peut pas être 0 ou négatif.',
            'patient_id.exists' => 'Le patient sélectionné n\'existe pas.',
            'patient_id.integer' => 'L\'ID patient doit être un nombre entier.',
        ];
    }

    /**
     * Sanitize inputs
     */
    public function sanitized()
    {
        return [
            'nom_traitement' => trim(strip_tags($this->input('nom_traitement'))),
            'description' => trim(strip_tags($this->input('description'))),
            'prix' => (float) $this->input('prix'),
            'consultation_id' => $this->input('consultation_id') ? (int) $this->input('consultation_id') : null,
            'patient_id' => $this->input('patient_id') ? (int) $this->input('patient_id') : null,
        ];
    }
}
