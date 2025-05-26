import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { UserService } from '../user/service/user.service';
import { ClientService } from '../client/service/client.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) throw new UnauthorizedException('No token provided');
    const token = authHeader.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      if (payload.type === 'user') {
        const user = await this.userService.findByUsername(payload.username);
        if (!user) throw new UnauthorizedException('User not found');
        request.user = user;
      } else if (payload.type === 'client') {
        const client = await this.clientService.findByClientId(
          payload.clientId,
        );
        if (!client) throw new UnauthorizedException('Client not found');
        request.client = client;
      } else {
        throw new UnauthorizedException('Invalid token type');
      }
      return true;
    } catch (e) {
      console.error('JWT Verification Error:', e);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
