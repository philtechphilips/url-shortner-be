import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { UrlService } from '../service/url.service';
import { CreateShortUrlDto } from '../dto/url.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';

@ApiTags('urls')
@ApiBearerAuth('JWT-auth')
@Controller('urls')
export class UrlController {
  constructor(private readonly urlService: UrlService) {}

  @UseGuards(JwtAuthGuard)
  @Post('shorten')
  async shorten(@Body() dto: CreateShortUrlDto, @Req() req: any) {
    // user or client will be attached to req by AuthGuard
    const url = await this.urlService.createShortUrl(dto, req.user, req.client);
    return {
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      createdAt: url.createdAt,
    };
  }

  @Get(':shortCode')
  async getOriginal(@Param('shortCode') shortCode: string) {
    const url = await this.urlService.findByShortCode(shortCode);
    if (!url) return { error: 'Not found' };
    return { originalUrl: url.originalUrl };
  }
}
