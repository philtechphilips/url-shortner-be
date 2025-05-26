import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Url } from '../entity/url.entity';
import { User } from '../../user/entity/user.entity';
import { Client } from '../../client/entity/client.entity';
import { CreateShortUrlDto } from '../dto/url.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UrlService {
  constructor(
    @InjectRepository(Url)
    private readonly urlRepository: Repository<Url>,
  ) {}

  async createShortUrl(
    dto: CreateShortUrlDto,
    user?: User,
    client?: Client,
  ): Promise<Url> {
    let shortCode = dto.customCode || randomBytes(4).toString('hex');
    // Ensure shortCode is unique
    while (await this.urlRepository.findOne({ where: { shortCode } })) {
      shortCode = randomBytes(4).toString('hex');
    }
    const url = this.urlRepository.create({
      originalUrl: dto.originalUrl,
      shortCode,
      user,
      client,
    });
    return this.urlRepository.save(url);
  }

  async findByShortCode(shortCode: string): Promise<Url | undefined> {
    return this.urlRepository.findOne({ where: { shortCode } });
  }

  async findAllForUser(user: User): Promise<Url[]> {
    return this.urlRepository.find({ where: { user } });
  }

  async findAllForClient(client: Client): Promise<Url[]> {
    return this.urlRepository.find({ where: { client } });
  }
}
