<?php

return [
    'endpoint' => env('MOMO_ENDPOINT', 'https://test-payment.momo.vn/v2/gateway/api/create'),
    'partner_code' => env('MOMO_PARTNER_CODE'),
    'access_key' => env('MOMO_ACCESS_KEY'),
    'secret_key' => env('MOMO_SECRET_KEY'),
    'redirect_url' => env('MOMO_REDIRECT_URL', env('FRONTEND_URL') . '/vi/wallet'),
    'ipn_url' => env('MOMO_IPN_URL', env('APP_URL') . '/api/v1/payments/momo/ipn'),
    'posting_fee' => (int) env('PROPERTY_POSTING_FEE', 100000),
];
