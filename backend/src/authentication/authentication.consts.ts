import { ConfigHelper } from '../configHandler';

// Expires August 31st
const juniorExpiryMonth = 7;
const juniorExpiryDay = 31;

function getDaysUntilNextExpiry(): number {
    const expiry = new Date();
    expiry.setMonth(juniorExpiryMonth, juniorExpiryDay);
    if (expiry < new Date()) { expiry.setFullYear(expiry.getFullYear() + 1); }
    const expiryTimeInMS = expiry.getTime() - new Date().getTime();
    return Math.round((expiryTimeInMS / (60 * 60 * 24 * 1000)));
}

export const saltRounds = 10;
export const jwt = {
    secret: ConfigHelper.getJWTSecret(),
    // jsonwebtoken reads a numeric `expiresIn` as seconds. These were `${n}d`
    // and `15m` until @types/jsonwebtoken 9.0.10 narrowed the option to the
    // `ms` template-literal type, which a computed string cannot satisfy.
    juniorExpiry: getDaysUntilNextExpiry() * 24 * 60 * 60,
    adminExpiry: 15 * 60,
};
export const maximumAttempts = 5;
