<?php
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\PatientController;
use App\Http\Controllers\Api\DentisteController;
use App\Http\Controllers\Api\SecretaireController;
use App\Http\Controllers\Api\RendezVousController;
use App\Http\Controllers\Api\ConsultationController;
use App\Http\Controllers\Api\TraitementController;
use App\Http\Controllers\Api\OrdonnanceController;
use App\Http\Controllers\Api\FactureController;
use App\Http\Controllers\Api\PaiementController;
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\CertificatController;
use App\Http\Controllers\Api\DevisController;
use App\Http\Controllers\Api\PasswordResetController;
use App\Http\Controllers\Api\PatientImageController;

// Auth Routes - Public
Illuminate\Support\Facades\Route::post('/auth/register', [AuthController::class, 'register']);
Illuminate\Support\Facades\Route::post('/auth/login', [AuthController::class, 'login']);
Illuminate\Support\Facades\Route::get('/auth/me', [AuthController::class, 'me']);

Illuminate\Support\Facades\Route::apiResources([
    'patients' => PatientController::class,
    'dentistes' => DentisteController::class,
    'secretaires' => SecretaireController::class,
    'rendez_vous' => RendezVousController::class,
    'consultations' => ConsultationController::class,
    'traitements' => TraitementController::class,
    'ordonnances' => OrdonnanceController::class,
    'factures' => FactureController::class,
    'paiements' => PaiementController::class,
    'certificats' => CertificatController::class,
    'devis' => DevisController::class,
]);

// Password Reset Routes
Illuminate\Support\Facades\Route::post('/password-reset/send-link', [PasswordResetController::class, 'sendResetLink']);
Illuminate\Support\Facades\Route::post('/password-reset/verify-token', [PasswordResetController::class, 'verifyToken']);
Illuminate\Support\Facades\Route::post('/password-reset/reset', [PasswordResetController::class, 'resetPassword']);

Illuminate\Support\Facades\Route::get('/notifications', [NotificationController::class, 'index']);
Illuminate\Support\Facades\Route::post('/notifications', [NotificationController::class, 'store']);
Illuminate\Support\Facades\Route::put('/notifications/{id}/read', [NotificationController::class, 'markAsRead']);
Illuminate\Support\Facades\Route::put('/notifications/read-all', [NotificationController::class, 'markAllAsRead']);

// Patient Image Routes
Illuminate\Support\Facades\Route::get('/patients/{id}/images', [PatientImageController::class, 'index']);
Illuminate\Support\Facades\Route::post('/patients/{id}/images', [PatientImageController::class, 'store']);
Illuminate\Support\Facades\Route::delete('/patient-images/{id}', [PatientImageController::class, 'destroy']);
