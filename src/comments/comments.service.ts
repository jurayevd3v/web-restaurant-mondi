import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { InjectModel } from '@nestjs/sequelize';
import { Comment } from './models/comment.model';

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
}
