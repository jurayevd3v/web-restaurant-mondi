import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Admin } from './models/admin.model';
import { JwtModule } from '@nestjs/jwt';
import { Background } from 'src/background/models/background.model';
import { Category } from 'src/category/models/category.model';

@Module({
  imports: [SequelizeModule.forFeature([Admin, Background, Category]), JwtModule],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {}
