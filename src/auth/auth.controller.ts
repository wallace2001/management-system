import { Controller, Post, Body, Get, UseGuards, Req, Delete, Param, ForbiddenException, NotFoundException, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UsersService } from 'src/users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RequestWithUser } from './types/request-with-user';
import { RegisterDto } from './dto/register.dto';
import { Roles } from './roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  async deleteUser(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ) {
    if (req.user.userId === id) {
      throw new ForbiddenException('You cannot delete yourself');
    }

    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.usersService.deleteUser(id);
    return { message: 'User deleted successfully' };
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('ADMIN')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const updated = await this.usersService.updateUser(id, dto);
    return updated;
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(
      dto.username,
      dto.password,
    );
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const user = await this.usersService.createUser(
      dto.username,
      dto.password,
      dto.role,
    );
    return { id: user.id, username: user.username, role: user.role };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async getMe(@Req() req: RequestWithUser) {
    return this.usersService.findById(req.user.userId);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN') // ✅ Apenas ADMIN pode listar usuários
  @ApiBearerAuth()
  async getAllUsers() {
    return this.usersService.findAll();
  }
}
