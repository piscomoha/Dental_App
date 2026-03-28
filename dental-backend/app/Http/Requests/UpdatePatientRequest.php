<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePatientRequest extends FormRequest
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
            'nom' => 'sometimes|required|string|max:100|regex:/^[a-zA-Zàâäæçéèêëïîôöœùûüœñ\s\-\']{1,100}$/',
            'prenom' => 'nullable|string|max:100|regex:/^[a-zA-Zàâäæçéèêëïîôöœùûüœñ\s\-\']{0,100}$/',
            'telephone' => 'nullable|regex:/^[\d\s\+\-\(\)]{7,20}$/',
            'date_naissance' => 'nullable|date|before_or_equal:today|after:1900-01-01',
            'adresse' => 'nullable|string|max:200|regex:/^[a-zA-Z0-9àâäæçéèêëïîôöœùûüœñ\s\-,\.]{0,200}$/',
            'sexe' => 'nullable|in:M,F',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'nom.required' => 'Le nom est requis.',
            'nom.string' => 'Le nom doit être un texte.',
            'nom.max' => 'Le nom ne doit pas dépasser 100 caractères.',
            'nom.regex' => 'Le nom contient des caractères invalides.',
            'prenom.string' => 'Le prénom doit être un texte.',
            'prenom.max' => 'Le prénom ne doit pas dépasser 100 caractères.',
            'prenom.regex' => 'Le prénom contient des caractères invalides.',
            'telephone.regex' => 'Format de téléphone invalide.',
            'date_naissance.date' => 'La date doit être valide.',
            'date_naissance.before_or_equal' => 'La date doit être antérieure à aujourd\'hui.',
            'date_naissance.after' => 'La date doit être après 1900.',
            'adresse.string' => 'L\'adresse doit être un texte.',
            'adresse.max' => 'L\'adresse ne doit pas dépasser 200 caractères.',
            'adresse.regex' => 'L\'adresse contient des caractères invalides.',
            'sexe.in' => 'Le sexe doit être M ou F.',
        ];
    }

    /**
     * Sanitize inputs
     */
    public function sanitized()
    {
        return [
            'nom' => trim(strip_tags($this->input('nom'))),
            'prenom' => trim(strip_tags($this->input('prenom'))) ?: '-',
            'telephone' => trim(strip_tags($this->input('telephone'))) ?: '-',
            'date_naissance' => $this->input('date_naissance') ?: '2000-01-01',
            'adresse' => trim(strip_tags($this->input('adresse'))),
            'sexe' => $this->input('sexe') ?: 'M',
        ];
    }
}
