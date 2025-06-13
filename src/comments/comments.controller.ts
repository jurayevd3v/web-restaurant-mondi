import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Put,
  Query,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/decorators/roles-auth-decorator';
import { RolesGuard } from 'src/guards/roles.guard';
import { Comment } from './models/comment.model';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Comment create' })
  @Post()
  async create(@Body() createDto: CreateCommentDto) {
    return this.commentsService.create(createDto);
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get()
  async getAll() {
    return this.commentsService.getAll();
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('comment')
  async getComment() {
    return this.commentsService.getComment();
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('employee/:id')
  async getEmployeeComment(@Param('id') id: string) {
    return this.commentsService.getEmployeeComment(+id);
  }

  @ApiOperation({ summary: 'Paginate menu' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('/page/:page')
  paginate(@Query('page') page: number) {
    return this.commentsService.paginate(page);
  }

  @ApiOperation({ summary: 'Comment view by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Comment> {
    return this.commentsService.getOne(+id);
  }

  @ApiOperation({ summary: 'Comment delete by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async delOne(@Param('id') id: string) {
    return this.commentsService.delOne(+id);
  }

  @ApiOperation({ summary: 'Comment update by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateCommentDto) {
    return this.commentsService.update(+id, updateDto);
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('comment-day/:day')
  async getCommentDay(@Param('day') day: string) {
    return this.commentsService.getCommentDay(day);
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('comment-week/:day')
  async getCommentWeek(@Param('day') day: string) {
    return this.commentsService.getCommentWeek(day);
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('comment-month/:month')
  async getCommentMonth(@Param('month') month: string) {
    return this.commentsService.getCommentMonth(month);
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('comment-year/:year')
  async getCommentYear(@Param('year') year: string) {
    return this.commentsService.getCommentYear(year);
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('employee-day/:id/:day')
  async getEmployeeCommentDay(
    @Param('id') id: string,
    @Param('day') day: string,
  ) {
    return this.commentsService.getEmployeeCommentDay(+id, day);
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('employee-week/:id/:day')
  async getEmployeeCommentWeek(
    @Param('id') id: string,
    @Param('day') day: string,
  ) {
    return this.commentsService.getEmployeeCommentWeek(+id, day);
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('employee-month/:id/:month')
  async getEmployeeCommentMonth(
    @Param('id') id: string,
    @Param('month') month: string,
  ) {
    return this.commentsService.getEmployeeCommentMonth(+id, month);
  }

  @ApiOperation({ summary: 'Comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('employee-year/:id/:year')
  async getEmployeeCommentYear(
    @Param('id') id: string,
    @Param('year') year: string,
  ) {
    return this.commentsService.getEmployeeCommentYear(+id, year);
  }
}
