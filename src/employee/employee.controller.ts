import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { RolesGuard } from 'src/guards/roles.guard';
import { Roles } from 'src/decorators/roles-auth-decorator';
import { Employee } from './models/employee.model';

@ApiTags('Employee')
@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @ApiOperation({ summary: 'Employee create' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Post()
  async create(@Body() createDto: CreateEmployeeDto) {
    return this.employeeService.create(createDto);
  }

  @ApiOperation({ summary: 'Employee view all' })
  @Get()
  async getAll() {
    return this.employeeService.getAll();
  }

  @ApiOperation({ summary: 'Paginate menu' })
  @Get('/page/:page')
  paginate(@Query('page') page: number) {
    return this.employeeService.paginate(page);
  }

  @ApiOperation({ summary: 'Employee view by ID' })
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<Employee> {
    return this.employeeService.getOne(+id);
  }

  @ApiOperation({ summary: 'Employee delete by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Delete(':id')
  async delOne(@Param('id') id: string) {
    return this.employeeService.delOne(+id);
  }

  @ApiOperation({ summary: 'Employee update by ID' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateEmployeeDto) {
    return this.employeeService.update(+id, updateDto);
  }

  @ApiOperation({ summary: 'Employee filter by comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('day/:day')
  async getDay(
    @Param('day') day: string,
  ) {
    return this.employeeService.getDay(day);
  }

  @ApiOperation({ summary: 'Employee filter by comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('week/:day')
  async getWeek(
    @Param('day') day: string,
  ) {
    return this.employeeService.getWeek(day);
  }

  @ApiOperation({ summary: 'Employee filter by comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('month/:month')
  async getMonth(
    @Param('month') month: string,
  ) {
    return this.employeeService.getMonth(month);
  }

  @ApiOperation({ summary: 'Employee filter by comment view all' })
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  @Get('year/:year')
  async getYear(
    @Param('year') year: string,
  ) {
    return this.employeeService.getYear(year);
  }
}
