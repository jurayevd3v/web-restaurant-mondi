import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Res,
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
import { Express } from 'express';
import { CategoryService } from './category.service';
import { CategoryCreateDto } from './dto/category-create.dto';
import { CategoryUpdateDto } from './dto/category-update.dto';
import { Category } from './models/category.model';

@ApiTags('Category')
@Controller('category')
export class CategoryController {
  constructor(private readonly service: CategoryService) {}

  @ApiOperation({ summary: 'Category create' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @Body() createDto: CategoryCreateDto,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
  ) {
    return this.service.create(createDto, image);
  }

  @ApiOperation({ summary: 'Category view all' })
  @Get()
  async getAll() {
    return this.service.getAll();
  }

  @ApiOperation({ summary: 'Paginate menu' })
  @Get(':category_id/page')
  paginate(@Param('category_id') category_id: string, @Query('page') page: number) {
    return this.service.paginate(category_id, page);
  }

  @ApiOperation({ summary: 'Category view by ID' })
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Category> {
    return this.service.getOne(+id);
  }

  @ApiOperation({ summary: 'Category delete by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async delOne(@Param('id') id: string) {
    return this.service.delOne(+id);
  }

  @ApiOperation({ summary: 'Category update by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Put(':id')
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id') id: string,
    @Body() updateDto: CategoryUpdateDto,
    @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
  ) {
    return this.service.update(+id, updateDto, image);
  }
}
