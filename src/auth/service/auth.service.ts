import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../../user/service/user.service';
import { ClientService } from '../../client/service/client.service';
import { User } from '../../user/entity/user.entity';
import { Client } from '../../client/entity/client.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly clientService: ClientService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.userService.validateUserByEmail(email, password);
  }

  async validateClient(clientId: string, clientSecret: string): Promise<Client | null> {
    return this.clientService.validateClient(clientId, clientSecret);
  }

  async loginUser(user: User) {
    const payload = { sub: user.id, username: user.username, type: 'user' };
    return {
      userId: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      access_token: this.jwtService.sign(payload),
      expires_in: process.env.JWT_EXPIRES_IN,
    };
  }

  async loginClient(client: Client) {
    const payload = { sub: client.id, clientId: client.clientId, type: 'client' };
    return {
      access_token: this.jwtService.sign(payload),
      expires_in: process.env.JWT_EXPIRES_IN,
    };
  }
}
