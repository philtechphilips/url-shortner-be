import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from '../service/user.service';
import { RegisterUserDto, LoginUserDto } from '../dto/user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const exists = await this.userService.findByUsername(dto.username) || await this.userService.findByEmail(dto.email);
    if (exists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.createUser(dto.username, dto.email, dto.password);
    return { id: user.id, username: user.username, email: user.email };
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const user = await this.userService.validateUserByEmail(dto.email, dto.password);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    // Token will be issued by AuthService, handled in AuthController
    return { id: user.id, username: user.username, email: user.email };
  }
}
