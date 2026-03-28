<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create sample users
        User::factory()->create([
            'name' => 'Test Admin',
            'email' => 'admin@dental.com',
        ]);

        // Create sample patients
        \App\Models\Patient::create([
            'nom' => 'Dupont',
            'prenom' => 'Marie',
            'telephone' => '0612345678',
            'date_naissance' => '1990-05-15',
            'adresse' => '123 Rue de Paris',
            'sexe' => 'Femme',
        ]);

        \App\Models\Patient::create([
            'nom' => 'Martin',
            'prenom' => 'Jean',
            'telephone' => '0687654321',
            'date_naissance' => '1985-03-22',
            'adresse' => '456 Rue de Lyon',
            'sexe' => 'Homme',
        ]);

        \App\Models\Patient::create([
            'nom' => 'Bernard',
            'prenom' => 'Sophie',
            'telephone' => '0698765432',
            'date_naissance' => '1995-07-10',
            'adresse' => '789 Rue de Marseille',
            'sexe' => 'Femme',
        ]);

        // Create sample dentistes
        \App\Models\Dentiste::create([
            'nom' => 'Benali',
            'prenom' => 'Youssef',
            'telephone' => '0611111111',
            'specialite' => 'Dentiste Général',
        ]);

        // Create sample secretaires
        \App\Models\Secretaire::create([
            'nom' => 'Dubois',
            'prenom' => 'Francoise',
            'telephone' => '0622222222',
            'email' => 'sec1@dental.com',
        ]);
    }
}
