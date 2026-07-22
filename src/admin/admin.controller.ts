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
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Request, Response } from 'express';
import { CookieGetter } from '../decorators/cookieGetter.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from '../decorators/roles-auth-decorator';
import { RolesGuard } from '../guards/roles.guard';
import { AdminService } from './admin.service';
import { AdminCreateDto } from './dto/admin-create.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { Admin } from './models/admin.model';
import { ADminUpdateDto } from './dto/admin-update.dto';
import { AdminSecretGuard } from 'src/guards/admin-secret.guard';

function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'] as string;
  return forwarded?.split(',')[0]?.trim() || req.socket.remoteAddress || req.ip;
}

@ApiTags('Admin')
@Controller('admin')
export class AdminController {
  constructor(private readonly service: AdminService) {}

  @ApiOperation({ summary: 'Admin create' })
  @ApiSecurity('admin-secret')
  @UseGuards(AdminSecretGuard)
  @Post('create')
  async create(
    @Body() createDto: AdminCreateDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.service.create(createDto, res, getClientIp(req));
  }

  @ApiOperation({ summary: 'Admin login' })
  @Post('login')
  async login(
    @Body() loginDto: AdminLoginDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.service.login(loginDto, res, getClientIp(req));
  }

  @ApiOperation({ summary: 'Admin logout' })
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.service.logout(refreshToken, res, getClientIp(req));
  }

  @ApiOperation({ summary: 'Admin refresh token' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh/:id')
  async refresh(
    @Param('id') id: string,
    @CookieGetter('refresh_token') refreshToken: string,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.service.refreshToken(+id, refreshToken, res, getClientIp(req));
  }

  @ApiOperation({ summary: 'Admin view all' })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @ApiOperation({ summary: 'Admin view by ID' })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Admin> {
    return this.service.getOne(+id);
  }

  @ApiOperation({ summary: 'Admin delete by ID' })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.service.delete(+id);
  }

  @ApiOperation({ summary: 'Admin update by ID' })
  @ApiBearerAuth()
  @Roles('ADMIN')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: ADminUpdateDto) {
    return this.service.update(+id, updateDto);
  }
}
