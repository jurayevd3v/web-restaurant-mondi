import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from 'src/files/files.module';
import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';
import { Menu } from './models/menu.model';

@Module({
  imports: [SequelizeModule.forFeature([Menu]), JwtModule, FilesModule],
  controllers: [MenuController],
  providers: [MenuService]
})
export class MenuModule {}