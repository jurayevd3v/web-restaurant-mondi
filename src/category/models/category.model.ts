import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Menu } from 'src/menu/models/menu.model';

interface CategoryAttr {
  name: string;
  image: string;
  sort: number;
}

@Table({ tableName: 'category' })
export class Category extends Model<Category, CategoryAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
  })
  name: string;

  @Column({
    type: DataType.STRING,
  })
  image: string;

  @Column({
    type: DataType.INTEGER,
  })
  sort: number;

  @HasMany(() => Menu, { onDelete: 'CASCADE' })
  menu: Menu;
}
