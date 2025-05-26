import { Controller, Post, Body, HttpException, HttpStatus, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ClientService } from '../service/client.service';
import { RegisterClientDto } from '../dto/client.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('clients')
@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @ApiOperation({ summary: 'Register a new client' })
  @ApiBearerAuth('JWT-auth')
  @ApiBody({
    type: RegisterClientDto,
    examples: {
      default: {
        summary: 'Register Client Example',
        value: {
          name: 'MyApp',
          redirectUris: ['https://myapp.com/callback', 'https://myapp.com/redirect'],
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Client registered successfully',
    schema: {
      example: {
        id: 1,
        name: 'MyApp',
        clientId: 'generated-client-id',
        clientSecret: 'generated-client-secret',
        redirectUris: ['https://myapp.com/callback', 'https://myapp.com/redirect'],
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('register')
  async register(@Body() dto: RegisterClientDto, @Req() req: any) {
    // req.user is set by JwtAuthGuard
    const client = await this.clientService.registerClient(dto.name, dto.redirectUris, req.user);
    return {
      id: client.id,
      name: client.name,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      redirectUris: client.redirectUris,
    };
  }
}
