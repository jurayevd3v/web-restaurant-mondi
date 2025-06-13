import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UpdateEmployeeDto } from './dto/update-employee.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Employee } from './models/employee.model';
import { Comment } from 'src/comments/models/comment.model';
import { Op } from 'sequelize';

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
    const employeesWithRatings = employees.map((emp) => {
      const comments = emp.comments || [];
      const totalComments = comments.length;
      const totalRating = comments.reduce(
        (sum, comment) => sum + comment.rating,
        0,
      );
      const avgRating =
        totalComments > 0 ? (totalRating / totalComments).toFixed(2) : 0;

      return {
        ...emp.toJSON(),
        avgRating,
      };
    });

    return employeesWithRatings;
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

  async getDay(day: string) {
    const start = new Date(day);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);

    return this.getStats(start, end);
  }

  async getWeek(day: string) {
    const inputDate = new Date(day);

    const dayOfWeek = inputDate.getDay();

    const monday = new Date(inputDate);
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(inputDate.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return this.getStats(monday, sunday);
  }

  async getMonth(month: string) {
    const [year, mon] = month.split('-').map(Number); // format: 2025-06
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1); // next month

    return this.getStats(start, end);
  }

  async getYear(year: string) {
    const y = Number(year);
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);

    return this.getStats(start, end);
  }

  private async getStats(start: Date, end: Date) {
    console.log(`Start date ${start}, End date ${end}`);
    const employees = await this.repo.findAll({
      include: [
        {
          model: Comment,
          where: {
            createdAt: {
              [Op.gte]: start,
              [Op.lt]: end,
            },
          },
          required: true,
        },
      ],
    });

    const employeesWithRatings = employees.map((emp) => {
      const comments = emp.comments || [];
      const totalComments = comments.length;
      const totalRating = comments.reduce(
        (sum, comment) => sum + comment.rating,
        0,
      );
      const avgRating =
        totalComments > 0 ? (totalRating / totalComments).toFixed(2) : 0;

      return {
        ...emp.toJSON(),
        avgRating,
      };
    });

    return employeesWithRatings;
  }
}
