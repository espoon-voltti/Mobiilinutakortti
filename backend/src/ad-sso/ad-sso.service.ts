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
  zSession,
} from './ad-sso-helper';
import { AdminService } from 'src/admin/admin.service';
import { AuthenticationService } from 'src/authentication/authentication.service';
import * as content from '../content';
import redisCacheProvider, { RedisClient } from './redis-cache-provider';
import { decrypt, encrypt } from 'src/utils/helpers';
import * as url from 'url';

const sessionCookieName = 'nutakortti.session';

const mockUsers = [
  {
    externalId: 'ad:001',
    name: 'Sanna Suunnittelija',
    email: 'sanna@example.com',
  },
  {
    externalId: 'ad:002',
    name: 'Olli Ohjaaja',
    email: 'olli@example.com',
  },
];

@Injectable()
export class AdSsoService {
  private readonly saml: SAML;
  private readonly logger = new Logger('Ad SSO Service');
  private readonly loginSuccessUrl: string;
  private readonly logoutSuccessUrl: string;
  private readonly apiBaseUrl: string;
  private readonly isMock: boolean;
  private readonly cryptoSecretKey: string;

  constructor(
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => AuthenticationService))
    private readonly authenticationService: AuthenticationService,
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClient,
  ) {
    const samlConfig = ConfigHelper.getSamlConfig();
    const cacheProvider = redisCacheProvider(redisClient, {
      keyPrefix: 'ad-saml-resp:',
    });
    this.saml = new SAML({ ...samlConfig, cacheProvider });
    const adminFrontEnBaseUrl = ConfigHelper.getAdminFrontEndBaseUrl();
    this.loginSuccessUrl = `${adminFrontEnBaseUrl}#/login?t=`;
    this.logoutSuccessUrl = `${adminFrontEnBaseUrl}#/login`;
    this.apiBaseUrl = ConfigHelper.getApiBaseUrl();
    this.isMock = samlConfig.isMock;
    this.cryptoSecretKey = ConfigHelper.getCryptoSecretKey();
  }

  async samlLogin(res: Response) {
    if (this.isMock) {
      res.redirect(`${this.apiBaseUrl}api/saml-ad/mock-login-form`);
      return;
    }

    try {
      const redirectUrl = await this.saml.getAuthorizeUrlAsync(
        '',
        undefined,
        {},
      );
      res.redirect(redirectUrl);
      return;
    } catch (error) {
      this.logger.error('Error: samlLogin', JSON.stringify(error));
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
            JSON.stringify(parseResult),
          );
          // TODO: Add custom error for this
          throw new InternalServerErrorException(
            'Error parsing the profile fields',
            content.FailedAdSsoLogin,
          );
        } else {
          const user = {
            email: parseResult.data[AD_EMAIL_KEY],
            firstName: parseResult.data[AD_GIVEN_NAME_KEY],
            lastName: parseResult.data[AD_FAMILY_NAME_KEY],
          };

          const result = await this.adminService.upsertAdmin(user);
          const token = await this.authenticationService.signToken(
            result.id,
            true,
          );
          // Set the JWT in an HTTP-only cookie (security measure)
          const {
            issuer,
            nameID,
            nameIDFormat,
            nameQualifier,
            spNameQualifier,
            sessionIndex,
          } = parseResult.data;

          res.cookie(
            sessionCookieName,
            encrypt(this.cryptoSecretKey, {
              issuer,
              nameID,
              nameIDFormat,
              nameQualifier,
              spNameQualifier,
              sessionIndex,
            }),
            {
              signed: true,
              httpOnly: true, // Prevent access to the cookie via JavaScript
              secure: true, // Ensure the cookie is sent over HTTPS
              sameSite: 'lax', // Prevent CSRF attacks
            },
          );
          // Redirect the user to the frontend
          res.redirect(`${this.loginSuccessUrl}${token.access_token}`);
        }
      }
    } catch (error) {
      this.logger.error('Error: samlLoginCallBack', JSON.stringify(error));
      throw new InternalServerErrorException(error, content.FailedAdSsoLogin);
    }
  }

  // Initiates SAML Single Logout (SLO) with the IdP
  async samlLogout(req: Request, res: Response) {
    // Pre-emptively clear the cookie, so even if something fails later, we
    // will end up clearing the cookie in the response
    res.clearCookie(sessionCookieName);

    if (this.isMock) {
      this.logger.log('samlLogout().isMock');
      res.redirect(`${this.apiBaseUrl}api/saml-ad/mock-logout-callback`);
      return;
    }

    try {
      const session = decrypt(
        this.cryptoSecretKey,
        req.signedCookies[sessionCookieName],
      );

      if (!session) {
        this.logger.error('No cookie thats needed for the saml');
        res.redirect(this.logoutSuccessUrl);
      } else {
        const parseResult = zSession.safeParse(session);
        if (!parseResult.success) {
          this.logger.error(
            'Error: samlLogout: parseResult.success',
            JSON.stringify(parseResult.error),
          );
          res.redirect(this.logoutSuccessUrl);
        } else {
          const {
            issuer,
            nameID,
            nameIDFormat,
            nameQualifier,
            spNameQualifier,
            sessionIndex,
          } = parseResult.data;

          const redirectUrl = await this.saml.getLogoutUrlAsync(
            {
              issuer,
              nameID,
              nameIDFormat,
              nameQualifier,
              spNameQualifier,
              sessionIndex,
            },
            'logout-success',
            {},
          );
          res.redirect(redirectUrl);
        }
      }
    } catch (error) {
      this.logger.error('Error: samlLogout', JSON.stringify(error));
      res.redirect(this.logoutSuccessUrl);
    }
  }

  async samlLogoutCallbackGet(req: Request, res: Response) {
    try {
      const originalQuery = url.parse(req.url).query ?? '';

      const { profile, loggedOut } = await this.saml.validateRedirectAsync(
        req.query,
        originalQuery,
      );
      if (loggedOut) {
        if (profile) {
          const redirectUrl = await this.saml.getLogoutResponseUrlAsync(
            profile,
            '',
            {},
            false,
          );
          res.redirect(redirectUrl);
        } else {
          res.redirect(this.logoutSuccessUrl);
        }
      }
    } catch (error) {
      this.logger.error('Error: samlLogoutCallbackGet', JSON.stringify(error));
      res.redirect(this.logoutSuccessUrl);
    }
  }

  async mockSamlLoginForm(res: Response) {
    const userOptions = mockUsers.map((user, idx) => {
      const { externalId, name } = user;
      const json = JSON.stringify(user);
      return `<div>
                <input
                  type="radio"
                  id="${externalId}"
                  name="userId"
                  ${idx === 0 ? 'checked' : ''}
                 value="${externalId}" />
                <label for="${externalId}">${name}</label>
              </div>`;
    });

    const formUri = `${this.apiBaseUrl}api/saml-ad/mock-login-callback`;

    res.contentType('text/html').send(`
              <html lang='fi'>
              <body>
                <h1>Devausympäristön AD-kirjautuminen</h1>
                <form action="${formUri}" method="post">
                    ${userOptions.join('\n')}
                    <div style="margin-top: 20px">
                      <button type="submit">Kirjaudu</button>
                    </div>
                </form>
              </body>
              </html>
            `);
  }

  async mockSamlLoginCallBack(req: Request, res: Response) {
    if (!this.isMock) {
      return;
    }
    try {
      const user = mockUsers.find((u) => u.externalId === req.body.userId);
      const names = user.name.split(' ');
      const upsertUser = {
        email: user.email,
        firstName: names[0],
        lastName: names[1],
      };
      const result = await this.adminService.upsertAdmin(upsertUser);
      const token = await this.authenticationService.signToken(result.id, true);

      res.cookie(
        sessionCookieName,
        encrypt(this.cryptoSecretKey, {
          issuer: 'mock',
          nameID: user.email,
          nameIDFormat: 'mock',
        }),
        {
          signed: true,
          httpOnly: true, // Prevent access to the cookie via JavaScript
          secure: true, // Ensure the cookie is sent over HTTPS
          sameSite: 'lax', // Prevent CSRF attacks
        },
      );
      // Redirect the user to the frontend
      res.redirect(`${this.loginSuccessUrl}${token.access_token}`);
    } catch (error) {
      this.logger.error('Error: mockSamlLoginCallBack', error);
      throw new InternalServerErrorException(error, content.FailedAdSsoLogin);
    }
  }

  async mockSamlLogoutCallBack(req: Request, res: Response) {
    if (!this.isMock) {
      return;
    }
    res.clearCookie(sessionCookieName);
    res.redirect(this.logoutSuccessUrl);
  }
}
