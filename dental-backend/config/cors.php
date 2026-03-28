<?php

return [

    /*
    |--------------------------------------------------------------------------
    | CORS Settings for Dental App API
    |--------------------------------------------------------------------------
    |
    | This configuration provides secure CORS settings for the API
    |
    */

    'allowed_origins' => [
        'http://localhost:5173',      // Local development (Vite)
        'http://localhost:3000',      // Alternative local
        'http://127.0.0.1:5173',
        'http://127.0.0.1:3000',
        'http://localhost:8000',      // Backend itself
        // Add production URLs here
        // 'https://yourdomain.com',
    ],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_headers' => [
        'Content-Type',
        'Accept',
        'Authorization',
        'X-Requested-With',
        'X-CSRF-TOKEN',
    ],

    'exposed_headers' => [
        'Content-Type',
        'X-Total-Count',
    ],

    'max_age' => 86400, // 24 hours

    'supports_credentials' => true,
];
