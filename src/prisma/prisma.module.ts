import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { UsersService } from 'src/users/users.service';

@Global()
@Module({
  providers: [UsersService, PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
