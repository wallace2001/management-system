import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [UsersService, UsersRepository, PrismaService],
  exports: [UsersService], // exporta apenas o service
})
export class UsersModule {}
