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
  } from '@nestjs/common';
  import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
  import { Roles } from '../decorators/roles-auth-decorator';
  import { RolesGuard } from '../guards/roles.guard';
  import { FileInterceptor } from '@nestjs/platform-express';
  import { ImageValidationPipe } from 'src/pipes/image-validation.pipe';
import { BackgroundService } from './background.service';
import { BackgroundCreateDto } from './dto/background-create.dto';
import { Background } from './models/background.model';
  
  @ApiTags('Background')
  @Controller('background')
  export class BackgroundController {
    constructor(private readonly service: BackgroundService) {}
  
    @ApiOperation({ summary: "Background create" })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Post()
    @UseInterceptors(FileInterceptor('image'))
    async create(
      @Body() createDto: BackgroundCreateDto,
      @UploadedFile(new ImageValidationPipe()) image: Express.Multer.File,
    ) {
      return this.service.create(createDto, image);
    }
  
    @ApiOperation({ summary: "Background view all" })
    @Get()
    async getAll() {
      return this.service.getAll();
    }
  
    @ApiOperation({ summary: "Background view by ID" })
    @Get(':id')
    async getOne(@Param('id') id: string): Promise<Background> {
      return this.service.getOne(+id);
    }
  
    @ApiOperation({ summary: "Background delete by ID" })
    @Roles('ADMIN')
    @UseGuards(RolesGuard)
    @Delete(':id')
    async delOne(@Param('id') id: string) {
      return this.service.delOne(+id);
    }
  }
  