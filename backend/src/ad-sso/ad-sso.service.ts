import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ConfigHelper } from 'src/configHandler';
import _ from 'lodash';
import { SAML } from '@node-saml/node-saml';
import {
  AD_EMAIL_KEY,
  AD_FAMILY_NAME_KEY,
  AD_GIVEN_NAME_KEY,
  zPorfileWithSession,
  zProfile,
  zSession,
} from './ad-sso-helper';
import { AdminService } from 'src/admin/admin.service';
import { AuthenticationService } from 'src/authentication/authentication.service';
import * as content from '../content';

export interface RequestWithUser extends Request {
  samlLogoutRequest?: any;
  user?: any;
}

const cookie = 'nutakortti.session';

@Injectable()
export class AdSsoService {
  private readonly saml: SAML;
  private readonly logger = new Logger('Ad SSO Service');
  private readonly adminFrontEnBaseUrl: string;

  constructor(
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => AuthenticationService))
    private readonly authenticationService: AuthenticationService,
  ) {
    const samlConfig = ConfigHelper.getSamlConfig();
    this.saml = new SAML(samlConfig);
    this.adminFrontEnBaseUrl = ConfigHelper.getAdminFrontEndBaseUrl();
  }

  async samlLogin(res: Response) {
    console.log(ConfigHelper.getSamlConfig());
    try {
      const redirectUrl = await this.saml.getAuthorizeUrlAsync(
        '',
        undefined,
        {},
      );
      console.log('redirecting to: ', redirectUrl);
      res.redirect(redirectUrl);
      return;
    } catch (error) {
      this.logger.error('Error: samlLogin', error);
      throw new InternalServerErrorException(error, content.FailedAdSsoLogin);
    }
  }

  async samlLoginCallBack(req: Request, res: Response) {
    try {
      const { profile, loggedOut } = await this.saml.validatePostResponseAsync(
        req.body,
      );
      if (!loggedOut) {
        const parseResult = zPorfileWithSession.safeParse(profile);
        if (!parseResult.success) {
          this.logger.error(
            'Error: samlLoginCallBack: parseResult.error',
            parseResult.error,
          );
        } else {
          const user = {
            email: parseResult.data[AD_EMAIL_KEY],
            firstName: parseResult.data[AD_GIVEN_NAME_KEY],
            lastName: parseResult.data[AD_FAMILY_NAME_KEY],
          };
          // TODO: to support logout parse saml specific fields from profile
          //

          const result = await this.adminService.upsertAdmin(user);
          const token = await this.authenticationService.signToken(
            result.id,
            true,
          );
          // TODO: create salattu cookie with sessionContext ('Profile': issuer, nameID, nameIDFormat)
          // Set the JWT in an HTTP-only cookie (security measure)
          const { issuer, nameID, nameIDFormat } = parseResult.data;
          res.cookie(
            cookie,
            { issuer, nameID, nameIDFormat },
            {
              signed: true,
              httpOnly: true, // Prevent access to the cookie via JavaScript
              secure: true, // Ensure the cookie is sent over HTTPS
              sameSite: 'lax', // Prevent CSRF attacks
            },
          );

          // Redirect the user to the frontend
          res.redirect(
            `${this.adminFrontEnBaseUrl}#/login?t=${token.access_token}`,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error: samlLoginCallBack', error);
      throw new InternalServerErrorException(error, content.FailedAdSsoLogin);
    }
  }

  // Initiates SAML Single Logout (SLO) with the IdP
  async samlLogout(req: Request, res: Response) {
    const session = req.signedCookies[cookie];
    console.log(session);
    if (!session) {
      console.log('No cookie thats needed for the saml', session);
    }
    const parseResult = zSession.safeParse(session);
    if (!parseResult.success) {
      this.logger.error(
        'Error: samlLogout: parseResult.success',
        parseResult.error,
      );
    } else {
      const { issuer, nameID, nameIDFormat } = parseResult.data;
      const redirectUrl = await this.saml.getLogoutUrlAsync(
        { issuer, nameID, nameIDFormat },
        'logout-success',
        {},
      );
      console.log('REDIRECTING TO', redirectUrl);
      res.redirect(redirectUrl);
    }
  }
  async samlLogoutCallbackGet(req: Request, res: Response) {
    console.log('samlLogoutCallbackGet');
  }

  async samlLogoutCallbackPost(req: Request, res: Response) {
    console.log('samlLogoutCallbackPOST');
    const { profile, loggedOut } = await this.saml.validatePostResponseAsync(
      req.body,
    );
    // Profile seems to be null?
    console.log(profile, loggedOut);
    if (loggedOut) {
      // TODO: Match the profile fields to the cookie values
      // res.clearCookie(cookie);
      // Redirect the browser to locout success page which will clear the frontend token
      console.log('ADIOS');
      res.redirect(`${this.adminFrontEnBaseUrl}#/logout-success`);
    }
  }
}
