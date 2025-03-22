import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ enum: ['ADMIN', 'USER'] })
  @IsString()
  @IsNotEmpty()
  role: 'ADMIN' | 'USER' = 'USER';
}
