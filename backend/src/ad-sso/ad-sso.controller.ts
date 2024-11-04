import { Controller, Post, Get, Res, Req, Query } from '@nestjs/common';
import { Request, Response } from 'express';
import { Routes } from '../content';
import { ApiTags } from '@nestjs/swagger';
import { AdSsoService } from './ad-sso.service';

@Controller(`${Routes.api}/saml-ad`)
@ApiTags('Sso')
export class AdSsoController {
  constructor(private readonly adSsoService: AdSsoService) {}

  // Generate a login url and redirect the user to it to start the login
  @Get('')
  async getLoginRequestUrl(@Res() res: Response) {
    setCacheHeaders(res);
    await this.adSsoService.samlLogin(res);
  }

  // The IDP makes the browser POST to this callback during login flow, and
  // a SAML LoginResponse is included in the request.
  @Post('login/callback')
  async loginResponse(@Req() req: Request, @Res() res: Response) {
    setCacheHeaders(res);
    await this.adSsoService.samlLoginCallBack(req, res);
  }

  // SAML Single Logout (SLO) - logs out from IdP and the application
  @Get('logout')
  async singleLogout(@Req() req: Request, @Res() res: Response) {
    setCacheHeaders(res);
    await this.adSsoService.samlLogout(req, res);
  }

  @Get('/logout/callback')
  async postLogoutCallback(@Req() req: Request, @Res() res: Response) {
    setCacheHeaders(res);
    await this.adSsoService.samlLogoutCallbackGet(req, res);
  }

  // Mock endpoints
  @Get('mock-login-form')
  async getMockLoginForm(@Res() res: Response) {
    setCacheHeaders(res);
    await this.adSsoService.mockSamlLoginForm(res);
  }

  @Post('mock-login-callback')
  async postMockLoginCallback(@Req() req: Request, @Res() res: Response) {
    setCacheHeaders(res);
    await this.adSsoService.mockSamlLoginCallBack(req, res);
  }

  @Get('mock-logout-callback')
  async gettMockLogoutCallback(@Req() req: Request, @Res() res: Response) {
    setCacheHeaders(res);
    await this.adSsoService.mockSamlLogoutCallBack(req, res);
  }
}

// We are programmically returning the res so the headers have to be manually set also
const setCacheHeaders = (res: Response) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
};
