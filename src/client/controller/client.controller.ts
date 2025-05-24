import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ClientService } from '../service/client.service';
import { RegisterClientDto } from '../dto/client.dto';

@Controller('clients')
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  @Post('register')
  async register(@Body() dto: RegisterClientDto) {
    const client = await this.clientService.registerClient(dto.name, dto.redirectUris);
    return {
      id: client.id,
      name: client.name,
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      redirectUris: client.redirectUris,
    };
  }
}
