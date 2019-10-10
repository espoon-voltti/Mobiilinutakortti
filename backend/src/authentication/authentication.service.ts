import { Injectable, Inject, forwardRef, ConflictException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { AdminService } from '../admin/admin.service';
import { LoginAdminDto } from '../admin/dto';
import * as content from '../content.json';
import { LoginJuniorDto } from '../junior/dto';
import { JuniorService } from '../junior/junior.service';
import { JWTToken } from './jwt.model';

@Injectable()
export class AuthenticationService {
    constructor(
        @Inject(forwardRef(() => AdminService))
        private readonly adminService: AdminService,
        @Inject(forwardRef(() => JuniorService))
        private readonly juniorService: JuniorService,
        private readonly jwtService: JwtService) { }

    async loginAdmin(loginData: LoginAdminDto): Promise<JWTToken> {
        const user = await this.adminService.getAdmin(loginData.email);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        return await this.validateUser({
            providedPassword: loginData.password, hashedPassword: user.password,
        }, {
            id: user.id, identity: user.email,
        });
    }

    async loginJunior(loginData: LoginJuniorDto): Promise<JWTToken> {
        const user = await this.juniorService.getJunior(loginData.phoneNumber);
        if (!user) { throw new BadRequestException(content.UserNotFound); }
        return await this.validateUser({
            providedPassword: loginData.pin, hashedPassword: user.pin,
        }, {
            id: user.id, identity: user.pin,
        });
    }

    async validateUser(attempt: { providedPassword: string, hashedPassword: string }, user: { id: string, identity: string }): Promise<JWTToken> {
        const passwordMatch = await compare(attempt.providedPassword, attempt.hashedPassword);
        if (!passwordMatch) { throw new UnauthorizedException(content.FailedLogin); }
        return { access_token: this.jwtService.sign({ user: user.identity, sub: user.id }) } as JWTToken;
    }

}
