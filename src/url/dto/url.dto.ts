import { IsNotEmpty, IsOptional, IsUrl } from 'class-validator';

export class CreateShortUrlDto {
  @IsUrl()
  originalUrl: string;

  @IsOptional()
  @IsNotEmpty()
  customCode?: string;
}
