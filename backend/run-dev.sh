#!/bin/sh

COOKIE_SECRET=verysecret \
    CRYPTO_SECRET_KEY=01234567890123456789012345678901 \
    SUPER_ADMIN_FEATURES=true \
    AD_MOCK=true \
    npm run start:dev
