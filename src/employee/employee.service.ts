import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Employee } from './models/employee.model';
import { Comment } from 'src/comments/models/comment.model';

@Injectable()
export class EmployeeService {
  constructor(@InjectModel(Employee) private repo: typeof Employee) {}

  async create(createDto: CreateEmployeeDto) {
    const employee = await this.repo.create(createDto);
    return {
      message: 'Employee created',
      employee: employee,
    };
  }

  async getAll() {
    const employees = await this.repo.findAll({
      include: [{ model: Comment }],
    });

    let totalRating = 0;
    let totalComments = 0;

    for (const emp of employees) {
      if (emp.comments && emp.comments.length) {
        totalComments += emp.comments.length;
        totalRating += emp.comments.reduce(
          (sum, comment) => sum + comment.rating,
          0,
        );
      }
    }

    const avgRating = totalComments > 0 ? totalRating / totalComments : 0;

    return {
      employees,
      totalRating,
      totalComments,
      avgRating: +avgRating.toFixed(2),
    };
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;

      const employee = await this.repo.findAll({
        include: { all: true },
        offset,
        limit,
      });

      const total_count = await this.repo.count();
      const total_pages = Math.ceil(total_count / limit);
      return {
        status: 200,
        message: 'Employee retrieved successfully',
        data: {
          records: employee,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to retrieve employee. Please try again later',
      );
    }
  }

  async getOne(id: number): Promise<Employee> {
    const employee = await this.repo.findByPk(id, { include: { all: true } });
    return employee;
  }

  async delOne(id: number) {
    let employee = await this.repo.findOne({ where: { id } });
    await this.repo.destroy({ where: { id } });
    return {
      message: 'Employee deleted',
    };
  }

  async update(id: number, updateDto: UpdateEmployeeDto) {
    const employee = await this.repo.update(updateDto, {
      where: { id },
    });
    return {
      message: 'Employee updated',
      employee: employee,
    };
  }
}
