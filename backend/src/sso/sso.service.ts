/* tslint:disable variable-name */

import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import * as saml2 from 'saml2-js';
import * as fs from 'fs';
import * as url from 'url';
import { SAMLHelper } from './samlhelper';
import { AcsDto, SecurityContextDto } from '../authentication/dto';
import { AuthenticationService } from '../authentication/authentication.service';

@Injectable()
export class SsoService {
  private readonly entity_id: string;
  private readonly sp: saml2.ServiceProvider;
  private readonly idp: saml2.IdentityProvider;
  private readonly samlHelper;
  private readonly frontend_base_url: string;
  private readonly logger = new Logger('SSO Service');

  constructor(private readonly authenticationService: AuthenticationService) {
    // This is for local testing if you have the private key.
    let pkey = '';
    if (fs.existsSync('./certs/nutakortti-test_private_key.pem')) {
      pkey = fs
        .readFileSync('certs/nutakortti-test_private_key.pem')
        .toString();
    }

    // NOTE: Default configuration variables refer to AWS and Suomi.fi-tunnistus test environments.
    const cert_selection = process.env.CERT_SELECTION || 'test';
    this.entity_id =
      process.env.SP_ENTITY_ID || 'https://nutakortti-test.vantaa.fi';
    this.frontend_base_url =
      process.env.FRONTEND_BASE_URL || 'http://localhost:3001';

    const sp_options = {
      entity_id: this.entity_id,
      private_key: !!process.env.SP_PKEY
        ? process.env.SP_PKEY.replace(/\\n/g, '\n')
        : pkey,
      certificate: fs
        .readFileSync('certs/nutakortti-' + cert_selection + '.cer')
        .toString(),
      assert_endpoint:
        process.env.SP_ASSERT_ENDPOINT ||
        'https://api.mobiilinuta-admin-test.com/api/acs',
      sign_get_request: true,
      allow_unencrypted_assertion: false,
    };
    this.sp = new saml2.ServiceProvider(sp_options);

    const idp_options = {
      sso_login_url:
        process.env.SSO_LOGIN_URL ||
        'https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SSO',
      sso_logout_url:
        process.env.SSO_LOGOUT_URL ||
        'https://testi.apro.tunnistus.fi/idp/profile/SAML2/Redirect/SLO',
      certificates: [
        fs
          .readFileSync('certs/tunnistus-' + cert_selection + '-1.cer')
          .toString(),
        fs
          .readFileSync('certs/tunnistus-' + cert_selection + '-2.cer')
          .toString(),
      ],
    };
    this.idp = new saml2.IdentityProvider(idp_options);

    this.samlHelper = new SAMLHelper(
      sp_options.private_key,
      idp_options.sso_logout_url,
    );
  }

  getLoginRequestUrl(res: Response) {
    this.sp.create_login_request_url(
      this.idp,
      {},
      (err, login_url, request_id) => {
        this.logger.log('Created login request, ID: ' + request_id);
        if (this._handleError(err, res)) return;

        res.send({ url: login_url });
      },
    );
  }

  handleLoginResponse(req: Request, res: Response) {
    const options = { request_body: req.body };
    const response = this.sp.post_assert(
      this.idp,
      options,
      (err, saml_response) => {
        // If the user cancels the authentication or SAML response status is not success, there will be an error.
        if (this._handleError(err, res)) return;

        this.logger.log(
          'Got login response, session index: ' +
            saml_response.user.session_index,
        );

        // For eIDAS logins the surname comes from a different attribute.
        const user_surname =
          this._getUserAttribute(
            saml_response.user.attributes,
            'http://eidas.europa.eu/attributes/naturalperson/CurrentFamilyName',
          ) ||
          this._getUserAttribute(
            saml_response.user.attributes,
            'urn:oid:2.5.4.4',
          );

        const acs_data = {
          sessionIndex: saml_response.user.session_index,
          nameId: saml_response.user.name_id,
          // Note: there might be several names, separated by spaces in a single string.
          firstName: this._getUserAttribute(
            saml_response.user.attributes,
            'http://eidas.europa.eu/attributes/naturalperson/CurrentGivenName',
          ),
          lastName: user_surname,
          zipCode: this._getUserAttribute(
            saml_response.user.attributes,
            'urn:oid:1.2.246.517.2002.2.6',
          ),
        } as AcsDto;

        const sc = this.authenticationService.generateSecurityContext(acs_data);
        const querystr = Buffer.from(JSON.stringify(sc))
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/\=+$/, '');
        const redirectUrl = `${this.frontend_base_url}/hakemus?sc=${querystr}`;
        res.redirect(redirectUrl);
      },
    );
  }

  getLogoutRequestUrl(req: Request, res: Response) {
    let sc_token: any = {};
    const token = req.headers.authorization;
    if (token.startsWith('Bearer ')) {
      const b64sc = token.slice(7, token.length);
      const binsc = Buffer.from(b64sc, 'base64').toString();
      sc_token = JSON.parse(binsc);
    }
    if (!sc_token) {
      this._handleError(new Error('Security context missing.'), res);
      return;
    }
    const sc = {
      sessionIndex: sc_token.sessionIndex,
      nameId: sc_token.nameId,
      firstName: sc_token.firstName,
      lastName: sc_token.lastName,
      zipCode: sc_token.zipCode,
      expiryTime: sc_token.expiryTime,
      signedString: sc_token.signedString,
    } as SecurityContextDto;

    if (!this.authenticationService.validateSecurityContext(sc)) {
      this._handleError(new Error('Security context invalid.'), res);
      return;
    }

    const options = {
      name_id: sc_token.nameId,
      session_index: sc_token.sessionIndex,
    };

    this.sp.create_logout_request_url(this.idp, options, (err, logout_url) => {
      if (this._handleError(err, res)) return;

      this.logger.log(
        'Created logout request URL, session index: ' + options.session_index,
      );
      let fixed_logout_url = '';
      try {
        fixed_logout_url = this.samlHelper.fixMissingXMLAttributes(logout_url);
      } catch (ex) {
        this._handleError(ex.message, res);
        return;
      }

      res.send({ url: fixed_logout_url });
    });
  }

  // When SP initiates a logout and response comes from IdP, request will have a SAMLResponse.
  // When IdP initiates a logout, request will have a SAMLRequest.
  handleLogout(req: Request, res: Response) {
    const query = url.parse(req.url, true).query;
    const idp_initiated = 'SAMLRequest' in query;

    // We have to respond to the request if IdP-initiated.
    // NOTE: if going strictly along the specs, we should also logout the client at this point.
    // However, since the login info is stored only on client side, we do nothing here except
    // respond to the request. The security vulnerability attack vector this implies is
    // negligible in this case, so it's not worth complicating the system with backend login info.
    if (idp_initiated) {
      const request_id = this.samlHelper.getSAMLRequestId(
        query.SAMLRequest.toString(),
      );
      const options = {
        in_response_to: request_id,
      };
      this.sp.create_logout_response_url(
        this.idp,
        options,
        (err, response_url) => {
          this.logger.log(
            'Created logout response URL for request ID: ' +
              options.in_response_to,
          );
          res.redirect(response_url);
        },
      );
    } else {
      // NOTE: we don't probably have to care about nonsuccessful status at all but here goes anyway.
      if (!this.samlHelper.checkLogoutResponse(req.url)) {
        this._handleError(
          new Error('Suomi.fi returned nonsuccessful logout status.'),
          res,
        );
        return;
      }

      res.redirect(`${this.frontend_base_url}/uloskirjaus`);
    }
  }

  private _getUserAttribute(
    user_attributes: { [attr: string]: string | string[] },
    attribute: string,
  ): string {
    const val =
      attribute in user_attributes ? user_attributes[attribute] : [''];
    return Array.isArray(val) ? val.join(' ') : '';
  }

  private _handleError(err: Error, res: Response): boolean {
    if (err != null) {
      this.logger.log('Error: ' + err);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(err);
      res.end();
      return true;
    }
    return false;
  }
}
