import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  UseInterceptors,
  UploadedFile,
  Query,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../decorators/roles-auth-decorator';
import { RolesGuard } from '../guards/roles.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageValidationPipe } from 'src/pipes/image-validation.pipe';
import { MenuService } from './menu.service';
import { MenuCreateDto } from './dto/menu-create.dto';
import { Menu } from './models/menu.model';
import { MenuUpdateDto } from './dto/menu-update.dto';
import { Express } from 'express';

@ApiTags('Menu')
@Controller('menu')
export class MenuController {
  constructor(private readonly service: MenuService) {}

  @ApiOperation({ summary: 'Menu create' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createDto: MenuCreateDto,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
  ) {
    return this.service.create(createDto, image);
  }

  @ApiOperation({ summary: 'Menu view all' })
  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @ApiOperation({ summary: 'Paginate menu' })
  @Get(':category_id/page')
  paginate(@Param('category_id') category_id: string, @Query('page') page: number) {
    return this.service.paginate(category_id, page);
  }

  @ApiOperation({ summary: 'Menu view by ID' })
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Menu> {
    return this.service.getOne(+id);
  }

  @ApiOperation({ summary: 'Menu delete by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async delOne(@Param('id') id: string) {
    return this.service.delOne(+id);
  }

  @ApiOperation({ summary: 'Menu update by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateDto: MenuUpdateDto,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
  ) {
    return this.service.update(+id, updateDto, image);
  }
}
