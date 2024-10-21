import {
  Controller,
  Post,
  Body,
  Get,
  Res,
  Req,
  UseFilters,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Routes } from '../content';
import { ApiTags } from '@nestjs/swagger';
import { AdSsoService } from './ad-sso.service';

@Controller(`${Routes.api}/auth/saml`)
@ApiTags('Sso')
export class AdSsoController {
  constructor(private readonly adSsoService: AdSsoService) {}

  // Our application directs the browser to this endpoint to start the login
  // flow. We generate a LoginRequest.
  @Get('login')
  getLoginRequestUrl(@Res() res: Response) {
    // Passport will handle redirect to SAML Identity Provider (IdP)
  }

  // The IDP makes the browser POST to this callback during login flow, and
  // a SAML LoginResponse is included in the request.
  @Post('login/callback')
  loginResponse(@Req() req: Request, @Res() res: Response) {
    const user = req.user;
    //TODO: upsert user?
    //TODO: redirect to app?
  }

  // SAML Single Logout (SLO) - logs out from IdP and the application
  @Get('logout')
  async singleLogout(@Req() req: Request, @Res() res: Response) {
    this.adSsoService.samlLogout(req, res);
  }

  // The IDP makes the browser either GET or POST one of these endpoints in two
  // separate logout flows.
  // 1. SP-initiated logout. In this case the logout flow started from us
  //   (= /auth/saml/logout endpoint), and a SAML LogoutResponse is included
  //   in the request.
  // 2. IDP-initiated logout (= SAML single logout). In this case the logout
  //   flow started from the IDP, and a SAML LogoutRequest is included in the
  //   request.
  @Get('/logout/callback')
  getLogoutCallBack(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      req.session!.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        res.redirect('/');
      });
    });
  }
  @Post('/logout/callback')
  postLogoutCallback(@Req() req: Request, @Res() res: Response) {
    req.logout(() => {
      req.session!.destroy((err) => {
        if (err) {
          console.error('Error destroying session:', err);
        }
        res.redirect('/');
      });
    });
  }
}
