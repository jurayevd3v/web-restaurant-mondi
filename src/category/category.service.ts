import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FilesService } from 'src/files/files.service';
import { Category } from './models/category.model';
import { CategoryCreateDto } from './dto/category-create.dto';
import { CategoryUpdateDto } from './dto/category-update.dto';
import { Menu } from 'src/menu/models/menu.model';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category) private repo: typeof Category,
    @InjectModel(Menu) private repoMenu: typeof Menu,
    private readonly fileService: FilesService,
  ) {}

  async create(createDto: CategoryCreateDto, image: any) {
    if (image) {
      let image_name: string;
      try {
        image_name = await this.fileService.createFile(image);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
      const category = await this.repo.create({
        image: image_name,
        ...createDto,
      });
      return {
        message: 'Category created',
        category: category,
      };
    }
  }

  async getAll() {
    const categories = await this.repo.findAll();

    // Function to handle sorting with 0 values going to the end
    function sortWithZeroAtEnd(a, b) {
      const sortA = a.sort !== undefined ? a.sort : 0;
      const sortB = b.sort !== undefined ? b.sort : 0;

      if (sortA === 0 && sortB === 0) {
        return 0;
      } else if (sortA === 0) {
        return 1;
      } else if (sortB === 0) {
        return -1;
      } else {
        return sortA - sortB;
      }
    }

    // Sort categories
    categories.sort(sortWithZeroAtEnd);

    // Sort each category's menu
    categories.forEach((category) => {
      if (category.menu && Array.isArray(category.menu)) {
        category.menu.sort(sortWithZeroAtEnd);
      }
    });

    return categories;
  }

  async paginate(category_id: string, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;

      const category = await this.repo.findByPk(category_id);

      const menus = await this.repoMenu.findAll({
        where: { category_id },
        offset,
        limit,
      });

      const total_count = await this.repoMenu.count({ where: { category_id } });
      const total_pages = Math.ceil(total_count / limit);
      return {
        status: 200,
        message: 'Menus retrieved successfully',
        data: {
          category,
          records: menus,
          pagination: {
            currentPage: page,
            total_pages,
            total_count,
          },
        },
      };
    } catch (error) {
      throw new BadRequestException(
        'Failed to retrieve menus. Please try again later',
      );
    }
  }

  async getOne(id: number): Promise<Category> {
    const category = await this.repo.findByPk(id, { include: { all: true } });
    return category;
  }

  async delOne(id: number) {
    let category = await this.repo.findOne({ where: { id } });
    await this.repo.destroy({ where: { id } });

    if (category.image !== 'null') {
      try {
        await this.fileService.deleteFile(category.image);
      } catch (error) {
        console.log(error);
      }
    }
    return {
      message: 'Category deleted',
    };
  }

  async update(id: number, updateDto: CategoryUpdateDto, image: any) {
    if (image) {
      let image_name: string;
      let oldCategoryImage = await this.repo.findOne({ where: { id } });
      try {
        if (oldCategoryImage.image !== 'null') {
          try {
            await this.fileService.deleteFile(oldCategoryImage.image);
          } catch (error) {
            console.log(error);
          }
        }
        image_name = await this.fileService.createFile(image);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
      const category = await this.repo.update(
        {
          image: image_name,
          ...updateDto,
        },
        { where: { id } },
      );
      return {
        message: 'Category updated',
        category: category,
      };
    }
    const category = await this.repo.update(updateDto, {
      where: { id },
    });
    return {
      message: 'Category updated',
      category: category,
    };
  }
}
