import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { FilesService } from 'src/files/files.service';
import { Background } from './models/background.model';
import { BackgroundCreateDto } from './dto/background-create.dto';

@Injectable()
export class BackgroundService {
  constructor(
    @InjectModel(Background) private repo: typeof Background,
    private readonly fileService: FilesService,
  ) {}

  async create(createDto: BackgroundCreateDto, image: any) {
    if (image) {
      let image_name: string;
      const backgrounds = await this.repo.findAll({ include: { all: true } });
      if (backgrounds.length == 1){
        try {
          await this.fileService.deleteFile(backgrounds[0].image);
          await this.repo.destroy({ where: { id: backgrounds[0].id } });
        } catch (error) {
          console.log(error);
        }
      }
      try {
        image_name = await this.fileService.createFile(image);
      } catch (error) {
        throw new BadRequestException(error.message);
      }
      const background = await this.repo.create({
        image: image_name,
        ...createDto,
      });
      return {
        message: 'Image created',
        background: background,
      };
    }
  }

  async getAll() {
    const background = await this.repo.findAll({ include: { all: true } });
    return background;
  }

  async getOne(id: number): Promise<Background> {
    const background = await this.repo.findByPk(id);
    return background;
  }

  async delOne(id: number) {
    let background = await this.repo.findOne({ where: { id } });
    await this.repo.destroy({ where: { id } });

    if (background.image !== 'null') {
      try {
        await this.fileService.deleteFile(background.image);
      } catch (error) {
        console.log(error);
      }
    }
    return {
      message: 'Image deleted',
    };
  }
}
