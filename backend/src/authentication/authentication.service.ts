import {
  BadRequestException,
  Body,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Logger } from '@nestjs/common';
import { compare } from 'bcrypt';
import { AdminService } from '../admin/admin.service';
import { LoginAdminDto } from '../admin/dto';
import * as content from '../content';
import { LoginJuniorDto } from '../junior/dto';
import { JuniorService } from '../junior/junior.service';
import { JWTToken } from './jwt.model';
import { jwt } from './authentication.consts';
import { AcsDto, SecurityContextDto } from './dto';
import { sign, unsign } from 'cookie-signature';
import { secretString } from './secret';
import * as moment from 'moment';

@Injectable()
export class AuthenticationService {
  private readonly logger = new Logger('Authentication Service');

  constructor(
    @Inject(forwardRef(() => AdminService))
    private readonly adminService: AdminService,
    @Inject(forwardRef(() => JuniorService))
    private readonly juniorService: JuniorService,
    private readonly jwtService: JwtService,
  ) {}

  async loginAdmin(loginData: LoginAdminDto): Promise<JWTToken> {
    const user = await this.adminService.getAdminByEmail(loginData.email);
    if (!user) {
      throw new BadRequestException(content.UserNotFound);
    }
    return await this.signToken(user.id, true);
  }

  async loginJunior(loginData: LoginJuniorDto): Promise<JWTToken> {
    const challengeResponse = await this.juniorService.attemptChallenge(
      loginData.id,
      loginData.challenge,
    );
    if (!challengeResponse) {
      throw new UnauthorizedException(content.FailedLogin);
    }
    return this.signToken(challengeResponse);
  }

  signToken(userId: string, isAdmin = false): JWTToken {
    const expiry = isAdmin ? jwt.adminExpiry : jwt.juniorExpiry;
    return {
      access_token: this.jwtService.sign(
        { sub: userId },
        { expiresIn: expiry },
      ),
    };
  }

  generateSecurityContext(@Body() acsData: AcsDto): SecurityContextDto {
    // Note: there might be multiple first names but it doesn't matter here.
    const { sessionIndex, nameId, firstName, lastName, zipCode } = acsData;
    const expiryTime = (new Date().getTime() / 1000 + 3600).toString();
    const signed = sign(
      `${expiryTime} ${sessionIndex} ${nameId} ${firstName} ${lastName} ${zipCode}`,
      secretString,
    );
    return {
      sessionIndex,
      nameId,
      firstName,
      lastName,
      zipCode,
      expiryTime,
      signedString: signed,
    } as SecurityContextDto;
  }

  validateSecurityContext(
    @Body() securityContext: SecurityContextDto,
  ): boolean {
    const {
      sessionIndex,
      nameId,
      firstName,
      lastName,
      zipCode,
      expiryTime,
      signedString,
    } = securityContext;
    const now = new Date();
    const timestampValid = Number(expiryTime) > now.getTime() / 1000;
    if (!timestampValid) {
      this.logger.warn(`Invalid timestamp`);
    }

    const unsigned = unsign(signedString || '', secretString);
    const expected = `${expiryTime} ${sessionIndex} ${nameId} ${firstName} ${lastName} ${zipCode}`;
    const signatureValid = unsigned === expected;
    if (!unsigned) {
      this.logger.error('Unable to decrypt signature');
    }
    if (!signatureValid) {
      this.logger.error(`Signatures don't match`);
    }

    return timestampValid && signatureValid;
  }
}
