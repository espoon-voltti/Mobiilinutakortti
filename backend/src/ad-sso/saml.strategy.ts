import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from '@node-saml/passport-saml';
import { ConfigHelper } from '../configHandler';

import { z } from 'zod';

const AD_GIVEN_NAME_KEY =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname';
const AD_FAMILY_NAME_KEY =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname';
const AD_EMAIL_KEY =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress';

const USER_ID_KEY =
  'http://schemas.microsoft.com/identity/claims/objectidentifier';

@Injectable()
export class SamlStrategy extends PassportStrategy(Strategy, 'saml') {
  constructor() {
    super(ConfigHelper.getSamlConfig());
  }

  // The validate method is used to extract the user information from the SAML response
  validate(profile: any): any {
    // This method is called when SAML authentication is successful
    return {
      id: profile[USER_ID_KEY],
      email: profile[AD_EMAIL_KEY],
      firstName: profile[AD_GIVEN_NAME_KEY],
      lastName: profile[AD_FAMILY_NAME_KEY],
    };
  }
}
