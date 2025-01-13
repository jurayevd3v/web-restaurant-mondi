import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Category } from './models/category.model';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from 'src/files/files.module';
import { Menu } from 'src/menu/models/menu.model';

@Module({
  imports: [SequelizeModule.forFeature([Category, Menu]), JwtModule, FilesModule],
  controllers: [CategoryController],
  providers: [CategoryService]
})
export class CategoryModule {}
