import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Url } from '../entity/url.entity';
import { UrlService } from '../service/url.service';
import { UrlController } from '../controller/url.controller';
import { AuthModule } from '../../auth/module/auth.module';
import { UserModule } from '../../user/module/user.module';
import { ClientModule } from '../../client/module/client.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Url]),
    AuthModule,
    UserModule,
    ClientModule,
    JwtModule.register({}),
  ],
  providers: [UrlService],
  controllers: [UrlController],
  exports: [UrlService],
})
export class UrlModule {}
