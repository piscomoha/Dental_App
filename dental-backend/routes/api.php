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
use App\Http\Controllers\NotificationController;
use App\Http\Controllers\Api\CertificatController;
use App\Http\Controllers\Api\DevisController;
use App\Http\Controllers\Api\PasswordResetController;

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
