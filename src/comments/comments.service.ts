import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './models/comment.model';
import { Op } from 'sequelize';

@Injectable()
export class CommentsService {
  constructor(@InjectModel(Comment) private repo: typeof Comment) {}

  async create(createDto: CreateCommentDto) {
    const comment = await this.repo.create(createDto);
    return {
      message: 'Comment created',
      comment: comment,
    };
  }

  async getAll() {
    const comment = await this.repo.findAll();
    return comment;
  }

  async getComment() {
    const comments = await this.repo.findAll({
      where: { target_type: 'restaurant' },
    });

    const totalComments = comments.length;
    const totalRating = comments.reduce(
      (sum, comment) => sum + comment.rating,
      0,
    );
    const avgRating =
      totalComments > 0 ? (totalRating / totalComments).toFixed(2) : 0;

    return {
      totalComments,
      totalRating,
      avgRating,
      comments,
    };
  }

  async getEmployeeComment(id: number) {
    const comments = await this.repo.findAll({
      where: { target_type: 'employee', target_id: id },
    });
    const totalComments = comments.length;
    const totalRating = comments.reduce(
      (sum, comment) => sum + comment.rating,
      0,
    );
    const avgRating =
      totalComments > 0 ? (totalRating / totalComments).toFixed(2) : 0;

    return {
      totalComments,
      totalRating,
      avgRating,
      comments,
    };
  }

  async paginate(page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;

      const comment = await this.repo.findAll({
        include: { all: true },
        offset,
        limit,
      });

      const total_count = await this.repo.count();
      const total_pages = Math.ceil(total_count / limit);
      return {
        status: 200,
        message: 'Comment retrieved successfully',
        data: {
          records: comment,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to retrieve comment. Please try again later',
      );
    }
  }

  async getOne(id: number): Promise<Comment> {
    const comment = await this.repo.findByPk(id, { include: { all: true } });
    return comment;
  }

  async delOne(id: number) {
    let comment = await this.repo.findOne({ where: { id } });
    await this.repo.destroy({ where: { id } });
    return {
      message: 'Comment deleted',
    };
  }

  async update(id: number, updateDto: UpdateCommentDto) {
    const comment = await this.repo.update(updateDto, {
      where: { id },
    });
    return {
      message: 'Comment updated',
      comment: comment,
    };
  }

  async getCommentDay(day: string) {
    const start = new Date(day);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);

    return this.getCommentStats(start, end);
  }

  async getCommentWeek(day: string) {
    const inputDate = new Date(day);

    const dayOfWeek = inputDate.getDay();

    const monday = new Date(inputDate);
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(inputDate.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return this.getCommentStats(monday, sunday);
  }

  async getCommentMonth(month: string) {
    const [year, mon] = month.split('-').map(Number); // format: 2025-06
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1); // next month

    return this.getCommentStats(start, end);
  }

  async getCommentYear(year: string) {
    const y = Number(year);
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);

    return this.getCommentStats(start, end);
  }

  async getEmployeeCommentDay(id: number, day: string) {
    const start = new Date(day);
    const end = new Date(day);
    end.setDate(end.getDate() + 1);

    return this.getEmployeeCommentStats(id, start, end);
  }

  async getEmployeeCommentWeek(id: number, day: string) {
    const inputDate = new Date(day);

    const dayOfWeek = inputDate.getDay();

    const monday = new Date(inputDate);
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    monday.setDate(inputDate.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    return this.getEmployeeCommentStats(id, monday, sunday);
  }

  async getEmployeeCommentMonth(id: number, month: string) {
    const [year, mon] = month.split('-').map(Number); // format: 2025-06
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 1); // next month

    return this.getEmployeeCommentStats(id, start, end);
  }

  async getEmployeeCommentYear(id: number, year: string) {
    const y = Number(year);
    const start = new Date(y, 0, 1);
    const end = new Date(y + 1, 0, 1);

    return this.getEmployeeCommentStats(id, start, end);
  }

  private async getCommentStats(start: Date, end: Date) {
    console.log(`Start date ${start}, End date ${end}`);
    const comments = await this.repo.findAll({
      where: {
        createdAt: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
        target_type: 'restaurant',
      },
    });

    const totalComments = comments.length;
    const totalRating = comments.reduce(
      (sum, comment) => sum + comment.rating,
      0,
    );
    const avgRating =
      totalComments > 0 ? (totalRating / totalComments).toFixed(2) : 0;

    return {
      totalComments,
      totalRating,
      avgRating,
      comments,
    };
  }

  private async getEmployeeCommentStats(id: number, start: Date, end: Date) {
    console.log(`Start date ${start}, End date ${end}`);
    const comments = await this.repo.findAll({
      where: {
        createdAt: {
          [Op.gte]: start,
          [Op.lt]: end,
        },
        target_type: 'employee',
        target_id: id,
      },
    });

    const totalComments = comments.length;
    const totalRating = comments.reduce(
      (sum, comment) => sum + comment.rating,
      0,
    );
    const avgRating =
      totalComments > 0 ? (totalRating / totalComments).toFixed(2) : 0;

    return {
      totalComments,
      totalRating,
      avgRating,
      comments,
    };
  }
}
