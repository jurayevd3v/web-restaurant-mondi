import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FilesService } from 'src/files/files.service';
import { Menu } from './models/menu.model';
import { MenuCreateDto } from './dto/menu-create.dto';
import { MenuUpdateDto } from './dto/menu-update.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectModel(Menu) private repo: typeof Menu,
    private readonly fileService: FilesService,
  ) {}

  async create(createDto: MenuCreateDto, image: any) {
    if (image) {
      let image_name: string;
      try {
        image_name = await this.fileService.createFile(image);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
      const menu = await this.repo.create({
        image: image_name,
        ...createDto,
      });
      return {
        message: 'Menu created',
        menu: menu,
      };
    } 
  }

  async getAll() {
    const menus = await this.repo.findAll({ include: { all: true } });
    menus.sort((a, b) => {
      if (a.type && !b.type) {
        return -1;
      } else if (!a.type && b.type) {
        return 1;
      } else {
        return 0;
      }
    });
    return menus;
  }


  async paginate(category_id: string, page: number): Promise<object> {
    try {
      page = Number(page);
      const limit = 10;
      const offset = (page - 1) * limit;

      const menus = await this.repo.findAll({
        where: { category_id },
        offset,
        limit,
      });

      if (!menus || menus.length === 0) {
        throw new NotFoundException(
          'No menus found for the specified category ID',
        );
      }

      const total_count = await this.repo.count({ where: { category_id } });
      const total_pages = Math.ceil(total_count / limit);
      return {
        status: 200,
        message: 'Menus retrieved successfully',
        data: {
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


  async getOne(id: number): Promise<Menu> {
    const menu = await this.repo.findByPk(id);
    return menu;
  }

  async delOne(id: number) {
    let menu = await this.repo.findOne({ where: { id } });
    await this.repo.destroy({ where: { id } });

    if (menu.image !== 'null') {
      try {
        await this.fileService.deleteFile(menu.image);
      } catch (error) {
        console.log(error);
      }
    }
    return {
      message: 'Menu deleted',
    };
  }

  async update(id: number, updateDto: MenuUpdateDto, image: any) {
    if (image) {
      let image_name: string;
      let oldMenuImage = await this.repo.findOne({ where: { id } });
      try {
        if (oldMenuImage.image !== 'null') {
          try {
            await this.fileService.deleteFile(oldMenuImage.image);
          } catch (error) {
            console.log(error);
          }
        }
        image_name = await this.fileService.createFile(image);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
      const menu = await this.repo.update(
        {
          image: image_name,
          ...updateDto,
        },
        { where: { id } },
      );
      return {
        message: 'Menu updated',
        menu: menu,
      };
    }
    const menu = await this.repo.update(updateDto, {
      where: { id },
    });
    return {
      message: 'Menu updated',
      menu: menu,
    };
  }
}
