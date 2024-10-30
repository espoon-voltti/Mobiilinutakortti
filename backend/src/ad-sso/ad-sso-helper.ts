import { z } from 'zod';

export const AD_GIVEN_NAME_KEY =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname';
export const AD_FAMILY_NAME_KEY =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname';
export const AD_EMAIL_KEY =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';
export const USER_ID_KEY =
  'http://schemas.microsoft.com/identity/claims/objectidentifier';

export const zProfile = z.object({
  [USER_ID_KEY]: z.string(),
  [AD_GIVEN_NAME_KEY]: z.string(),
  [AD_FAMILY_NAME_KEY]: z.string(),
  [AD_EMAIL_KEY]: z.string().optional(),
});

export const zSession = z.object({
  issuer: z.string(),
  nameID: z.string(),
  nameIDFormat: z.string(),
  nameQualifier: z.string(),
  spNameQualifier: z.string(),
  sessionIndex: z.string(),
});

export const zPorfileWithSession = zProfile.merge(zSession);
