import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Client } from '../../client/entity/client.entity';
import { randomBytes } from 'crypto';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async registerClient(
    name: string,
    redirectUris: string[],
    user: any,
  ): Promise<Client> {
    const clientId = randomBytes(16).toString('hex');
    const clientSecret = randomBytes(32).toString('hex');
    const client = this.clientRepository.create({
      name,
      clientId,
      clientSecret,
      redirectUris,
      user,
    });
    return this.clientRepository.save(client);
  }

  async findByClientId(clientId: string): Promise<Client | undefined> {
    return this.clientRepository.findOne({
      where: { clientId },
      relations: ['user'],
    });
  }

  async validateClient(
    clientId: string,
    clientSecret: string,
  ): Promise<Client | null> {
    const client = await this.findByClientId(clientId);
    if (client && client.clientSecret === clientSecret) {
      return client;
    }
    return null;
  }
}
