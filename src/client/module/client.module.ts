import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from '../entity/client.entity';
import { ClientService } from '../service/client.service';
import { ClientController } from '../controller/client.controller';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from '../../user/module/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Client]),
    UserModule,
    JwtModule.register({}),
  ],
  providers: [ClientService],
  controllers: [ClientController],
  exports: [ClientService],
})
export class ClientModule {}
