import { Injectable } from '@nestjs/common';
import { Response, Request } from 'express';
import { Strategy, VerifiedCallback } from '@node-saml/passport-saml';
import { ConfigHelper } from 'src/configHandler';

export interface RequestWithUser extends Request {
  samlLogoutRequest?: any;
  user?: any;
}

@Injectable()
export class AdSsoService {
  private readonly samlStrategy: Strategy;

  constructor() {
    this.samlStrategy = new Strategy(
      ConfigHelper.getSamlConfig(),
      async (profile: any, done: VerifiedCallback) => {
        // This is the signonVerify function
        try {
          // Handle successful authentication here
          const user = {
            id: profile.nameID,
            email: profile['email'],
            firstName: profile['firstName'],
            lastName: profile['lastName'],
          };

          // Pass the user to Passport's session handling
          done(null, user);
        } catch (error) {
          done(error, null);
        }
      },
      async (req: any, done: VerifiedCallback) => {
        // Optional: Handle logout verification, if needed
        done(null, null);
      },
    );
  }

  // Initiates SAML Single Logout (SLO) with the IdP
  samlLogout(req: Request, res: Response) {
    this.samlStrategy.logout(req, (err, url) => {
      if (err) {
        console.log(err);
      }

      // Redirect the user to the IdP logout URL
      return res.redirect(url);
    });
  }
}
