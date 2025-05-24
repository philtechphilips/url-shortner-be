import { Controller, Post, Body, HttpException, HttpStatus, Get, Query } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { UserService } from '../../user/service/user.service';
import { ClientService } from '../../client/service/client.service';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorizationCode } from '../entity/authorization-code.entity';
import { RefreshToken } from '../entity/refresh-token.entity';
import { randomBytes } from 'crypto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.loginUser(user);
  }

  @Post('token')
  async clientToken(@Body() body: { clientId: string; clientSecret: string }) {
    const client = await this.authService.validateClient(body.clientId, body.clientSecret);
    if (!client) {
      throw new HttpException('Invalid client credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.authService.loginClient(client);
  }
}

@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    @InjectRepository(AuthorizationCode)
    private readonly codeRepo: Repository<AuthorizationCode>,
    @InjectRepository(RefreshToken)
    private readonly refreshRepo: Repository<RefreshToken>,
  ) {}

  // Step 1: /oauth/authorize?client_id=...&redirect_uri=...&response_type=code&state=...
  @Get('authorize')
  async authorize(
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('response_type') responseType: string,
    @Query('state') state: string,
    @Query('username') username: string,
    @Query('password') password: string,
  ) {
    if (responseType !== 'code') throw new HttpException('Only code supported', HttpStatus.BAD_REQUEST);
    const client = await this.clientService.findByClientId(clientId);
    if (!client || !client.redirectUris.includes(redirectUri)) {
      throw new HttpException('Invalid client or redirect_uri', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.validateUser(username, password);
    if (!user) throw new HttpException('Invalid user credentials', HttpStatus.UNAUTHORIZED);
    // Issue code
    const code = randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await this.codeRepo.save(this.codeRepo.create({ code, client, user, redirectUri, expiresAt }));
    // Return code and state (API-only, not redirect)
    return { code, state };
  }

  // Step 2: /oauth/token (POST)
  @Post('token')
  async token(@Body() body: any) {
    if (body.grant_type === 'authorization_code') {
      // Exchange code for tokens
      const codeEntity = await this.codeRepo.findOne({
        where: { code: body.code },
        relations: ['client', 'user'],
      });
      if (!codeEntity || codeEntity.expiresAt < new Date()) {
        throw new HttpException('Invalid or expired code', HttpStatus.BAD_REQUEST);
      }
      if (codeEntity.client.clientId !== body.client_id || codeEntity.client.clientSecret !== body.client_secret) {
        throw new HttpException('Invalid client credentials', HttpStatus.UNAUTHORIZED);
      }
      if (codeEntity.redirectUri !== body.redirect_uri) {
        throw new HttpException('redirect_uri mismatch', HttpStatus.BAD_REQUEST);
      }
      // Issue tokens
      const access = await this.authService.loginUser(codeEntity.user);
      const refreshToken = randomBytes(32).toString('hex');
      const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
      await this.refreshRepo.save(this.refreshRepo.create({ token: refreshToken, client: codeEntity.client, user: codeEntity.user, expiresAt: refreshExpires }));
      // Remove code (one-time use)
      await this.codeRepo.delete({ id: codeEntity.id });
      return {
        access_token: access.access_token,
        token_type: 'bearer',
        expires_in: access.expires_in,
        refresh_token: refreshToken,
      };
    } else if (body.grant_type === 'refresh_token') {
      // Exchange refresh token for new access token
      const refresh = await this.refreshRepo.findOne({
        where: { token: body.refresh_token },
        relations: ['client', 'user'],
      });
      if (!refresh || refresh.expiresAt < new Date()) {
        throw new HttpException('Invalid or expired refresh token', HttpStatus.BAD_REQUEST);
      }
      if (refresh.client.clientId !== body.client_id || refresh.client.clientSecret !== body.client_secret) {
        throw new HttpException('Invalid client credentials', HttpStatus.UNAUTHORIZED);
      }
      const access = await this.authService.loginUser(refresh.user);
      return {
        access_token: access.access_token,
        token_type: 'bearer',
        expires_in: access.expires_in,
      };
    } else {
      throw new HttpException('Unsupported grant_type', HttpStatus.BAD_REQUEST);
    }
  }
}
