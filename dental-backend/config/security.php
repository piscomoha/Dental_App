<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Security Headers Configuration
    |--------------------------------------------------------------------------
    |
    | Configure security headers for the application
    |
    */

    'headers' => [
        // X-Content-Type-Options: Prevents MIME sniffing
        'X-Content-Type-Options' => 'nosniff',

        // X-Frame-Options: Prevents clickjacking
        'X-Frame-Options' => 'SAMEORIGIN',

        // X-XSS-Protection: XSS protection (legacy, but still good)
        'X-XSS-Protection' => '1; mode=block',

        // Referrer-Policy: Control referrer information
        'Referrer-Policy' => 'strict-origin-when-cross-origin',

        // Permissions-Policy: Feature permissions
        'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()',

        // Content-Security-Policy
        'Content-Security-Policy' => "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' http://localhost:8000 https:; frame-ancestors 'self'",

        // HSTS (HTTP Strict-Transport-Security) - Uncomment for production with HTTPS
        // 'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Configure rate limiting for API endpoints
    |
    */

    'rate_limit' => [
        'enabled' => true,

        // General API rate limit: 60 requests per minute per IP
        'api' => '60,1',

        // Login attempts limit: 5 requests per minute per IP
        'login' => '5,1',

        // Strict limit for sensitive operations: 20 requests per minute
        'sensitive' => '20,1',
    ],

    /*
    |--------------------------------------------------------------------------
    | Input Validation & Sanitization
    |--------------------------------------------------------------------------
    |
    | Global input validation rules
    |
    */

    'validation' => [
        // Maximum input string length
        'max_string_length' => 500,

        // Maximum text area length
        'max_text_length' => 2000,

        // Maximum array items
        'max_array_items' => 100,

        // Allowed file upload types
        'allowed_file_types' => ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx'],

        // Maximum file size in MB
        'max_file_size' => 10,
    ],

    /*
    |--------------------------------------------------------------------------
    | Authentication & Authorization
    |--------------------------------------------------------------------------
    |
    | Security settings for auth
    |
    */

    'auth' => [
        // Login attempts before lockout
        'max_login_attempts' => 5,

        // Lockout duration in minutes
        'lockout_duration' => 15,

        // Session timeout in minutes
        'session_timeout' => 60,

        // CSRF token expiration in minutes
        'csrf_token_expiration' => 120,
    ],

    /*
    |--------------------------------------------------------------------------
    | Database Security
    |--------------------------------------------------------------------------
    |
    | Security settings for database connections
    |
    */

    'database' => [
        // Enable query logging for security audit
        'query_logging' => env('DB_QUERY_LOGGING', false),

        // Hide sensitive columns from logs
        'hidden_columns' => ['password', 'token', 'secret'],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Monitoring & Logging
    |--------------------------------------------------------------------------
    |
    | Log security events
    |
    */

    'logging' => [
        // Log authentication attempts
        'log_auth' => true,

        // Log failed authorizations
        'log_authorization_failures' => true,

        // Log suspicious activities
        'log_suspicious_activities' => true,

        // Log all API requests (verbose)
        'log_all_requests' => env('API_REQUEST_LOGGING', false),
    ],
];
