<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class PasswordResetController extends Controller
{
    /**
     * Send password reset link to user email
     */
    public function sendResetLink(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|max:255',
            ], [
                'email.required' => 'L\'email est requis.',
                'email.email' => 'Format d\'email invalide.',
                'email.max' => 'L\'email ne doit pas dépasser 255 caractères.',
            ]);

            $user = User::where('email', $request->email)->first();

            if (!$user) {
                return response()->json(
                    ['message' => 'Si cet email existe, un lien de réinitialisation a été envoyé.'],
                    Response::HTTP_OK
                );
            }

            // Generate reset token
            $token = Str::random(64);

            // Save token to database (you'll need to create a password_resets table)
            // For now, we'll just return a success message
            \DB::table('password_reset_tokens')->updateOrInsert(
                ['email' => $user->email],
                [
                    'token' => Hash::make($token),
                    'created_at' => now(),
                ]
            );

            // TODO: Send email with reset link
            // Mail::send('emails.password-reset', [
            //     'resetUrl' => url('password-reset/' . $token . '?email=' . $user->email)
            // ], function($message) use ($user) {
            //     $message->to($user->email)
            //             ->subject('Réinitialiser votre mot de passe');
            // });

            return response()->json(
                ['message' => 'Un lien de réinitialisation a été envoyé à votre email.'],
                Response::HTTP_OK
            );
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Erreur lors de l\'envoi du lien de réinitialisation.'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Verify reset token
     */
    public function verifyToken(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email',
                'token' => 'required|string',
            ]);

            $resetRecord = \DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->first();

            if (!$resetRecord) {
                return response()->json(
                    ['error' => 'Token de réinitialisation invalide ou expiré.'],
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            // Check if token is older than 60 minutes
            $createdAt = \Carbon\Carbon::parse($resetRecord->created_at);
            if ($createdAt->addMinutes(60)->isPast()) {
                \DB::table('password_reset_tokens')->where('email', $request->email)->delete();
                return response()->json(
                    ['error' => 'Token expiré. Veuillez demander un nouveau lien.'],
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            return response()->json(
                ['message' => 'Token valide.'],
                Response::HTTP_OK
            );
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Erreur lors de la vérification du token.'],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Reset password with valid token
     */
    public function resetPassword(Request $request)
    {
        try {
            $request->validate([
                'email' => 'required|email|exists:users,email',
                'token' => 'required|string',
                'password' => 'required|string|min:8|confirmed',
                'password_confirmation' => 'required|string|min:8',
            ], [
                'email.required' => 'L\'email est requis.',
                'email.email' => 'Format d\'email invalide.',
                'email.exists' => 'Cet email n\'existe pas.',
                'token.required' => 'Le token est requis.',
                'password.required' => 'Le mot de passe est requis.',
                'password.min' => 'Le mot de passe doit avoir au moins 8 caractères.',
                'password.confirmed' => 'Les mots de passe ne correspondent pas.',
            ]);

            $resetRecord = \DB::table('password_reset_tokens')
                ->where('email', $request->email)
                ->first();

            if (!$resetRecord) {
                return response()->json(
                    ['error' => 'Token de réinitialisation invalide.'],
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            // Verify token
            if (!Hash::check($request->token, $resetRecord->token)) {
                return response()->json(
                    ['error' => 'Token invalide.'],
                    Response::HTTP_UNPROCESSABLE_ENTITY
                );
            }

            // Update user password
            $user = User::where('email', $request->email)->firstOrFail();
            $user->update(['password' => Hash::make($request->password)]);

            // Delete reset token
            \DB::table('password_reset_tokens')->where('email', $request->email)->delete();

            return response()->json(
                ['message' => 'Votre mot de passe a été réinitialisé avec succès.'],
                Response::HTTP_OK
            );
        } catch (\Throwable $e) {
            return response()->json(
                ['error' => 'Erreur lors de la réinitialisation du mot de passe. ' . $e->getMessage()],
                Response::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}
