<?php

use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DentisteController;
use App\Http\Controllers\Api\SecretaireController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\TraitementController;
use App\Http\Controllers\Api\OrdonnanceController;
use App\Http\Controllers\Api\FactureController;
use App\Http\Controllers\Api\PaiementController;

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});


