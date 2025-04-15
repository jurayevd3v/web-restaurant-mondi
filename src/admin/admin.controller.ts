import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Res,
  UseGuards,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CookieGetter } from '../decorators/cookieGetter.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles-auth-decorator';
import { RolesGuard } from '../guards/roles.guard';
import { AdminService } from './admin.service';
import { AdminCreateDto } from './dto/admin-create.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Admin } from './models/admin.model';
import { ADminUpdateDto } from './dto/admin-update.dto';

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @ApiOperation({ summary: 'Admin create' })
  @Post('create')
  async create(
    @Body() createDto: AdminCreateDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.service.create(createDto, res);
  }

  @ApiOperation({ summary: 'Admin login' })
  @Post('login')
  async login(
    @Body() loginDto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.service.login(loginDto, res);
  }

  @ApiOperation({ summary: 'Admin logout' })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.service.logout(refreshToken, res);
  }

  @ApiOperation({ summary: 'Admin view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @ApiOperation({ summary: 'Admin view by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Admin> {
    return this.service.getOne(+id);
  }

  @ApiOperation({ summary: 'Admin delete by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }

  @ApiOperation({ summary: 'Admin update by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: ADminUpdateDto) {
    return this.service.update(+id, updateDto);
  }
}
