import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Routes } from '../content';
import { SsoService } from './sso.service';

@Controller(`${Routes.api}`)
@ApiTags('Sso')
export class SsoController {
  constructor(private readonly ssoService: SsoService) {}

  // Call this to initiate login process.
  @Get('acs')
  getLoginRequestUrl(@Res() res: Response) {
    this.ssoService.getLoginRequestUrl(res);
  }

  // This is called when coming back from Suomi.fi identification.
  @Post('acs')
  loginResponse(@Req() req: Request, @Res() res: Response) {
    this.ssoService.handleLoginResponse(req, res);
  }

  // Call this to initiate logout process.
  @Get('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    this.ssoService.getLogoutRequestUrl(req, res);
  }

  // SSO logout, redirect binding.
  // Suomi.fi will redirect the user here after SP-initiated logout: there will be a SAMLResponse in the query.
  // Suomi.fi will also call this on IdP-initiated logouts: there will be a SAMLRequest in the query.
  @Get('slo')
  logoutRedirect(@Req() req: Request, @Res() res: Response) {
    this.ssoService.handleLogout(req, res);
  }
}
