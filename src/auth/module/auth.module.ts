import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from '../service/auth.service';
import { AuthController } from '../controller/auth.controller';
import { OAuthController } from '../controller/auth.controller';
import { UserModule } from '../../user/module/user.module';
import { ClientModule } from '../../client/module/client.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthorizationCode } from '../entity/authorization-code.entity';
import { RefreshToken } from '../entity/refresh-token.entity';

@Module({
  imports: [
    UserModule,
    ClientModule,
    TypeOrmModule.forFeature([AuthorizationCode, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  providers: [AuthService],
  controllers: [AuthController, OAuthController],
  exports: [AuthService],
})
export class AuthModule {}
