import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from '../service/user.service';
import { RegisterUserDto, LoginUserDto } from '../dto/user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    type: RegisterUserDto,
    examples: {
      default: {
        summary: 'Register Example',
        value: {
          username: 'johndoe',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          password: 'password123',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        id: 1,
        username: 'johndoe',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'User already exists' })
  @Post('register')
  async register(@Body() dto: RegisterUserDto) {
    const exists = await this.userService.findByEmail(dto.email);
    if (exists) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }
    const user = await this.userService.createUser(
      dto.username,
      dto.firstName,
      dto.lastName,
      dto.email,
      dto.password,
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }

//   @ApiOperation({ summary: 'Login user' })
//   @ApiBody({
//     type: LoginUserDto,
//     examples: {
//       default: {
//         summary: 'Login Example',
//         value: {
//           email: 'john@example.com',
//           password: 'password123',
//         },
//       },
//     },
//   })
//   @ApiResponse({
//     status: 200,
//     description: 'User logged in successfully',
//     schema: {
//       example: {
//         id: 1,
//         username: 'johndoe',
//         email: 'john@example.com',
//       },
//     },
//   })
//   @ApiResponse({ status: 401, description: 'Invalid credentials' })
//   @Post('login')
//   async login(@Body() dto: LoginUserDto) {
//     const user = await this.userService.validateUserByEmail(
//       dto.email,
//       dto.password,
//     );
//     if (!user) {
//       throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
//     }
//     // Token will be issued by AuthService, handled in AuthController
//     return { id: user.id, username: user.username, email: user.email };
//   }
}
