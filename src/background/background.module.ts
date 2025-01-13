import { Module } from '@nestjs/common';
import { BackgroundService } from './background.service';
import { BackgroundController } from './background.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Background } from './models/background.model';
import { JwtModule } from '@nestjs/jwt';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [SequelizeModule.forFeature([Background]), JwtModule, FilesModule],
  controllers: [BackgroundController],
  providers: [BackgroundService]
})
export class BackgroundModule {}
