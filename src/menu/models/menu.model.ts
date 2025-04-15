import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Category } from 'src/category/models/category.model';

interface MenuAttr {
  name: string;
  price: string;
  discount: string;
  type: boolean;
  new: boolean;
  description: string;
  image: string;
  sort: number;
}

@Table({ tableName: 'menu' })
export class Menu extends Model<Menu, MenuAttr> {
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
  price: string;

  @Column({
    type: DataType.STRING,
  })
  discount: string;

  @Column({
    type: DataType.BOOLEAN,
  })
  type: boolean;

  @Column({
    type: DataType.BOOLEAN,
  })
  new: boolean;

  @Column({
    type: DataType.TEXT,
  })
  description: string;

  @Column({
    type: DataType.STRING,
  })
  image: string;

  @Column({
    type: DataType.INTEGER,
  })
  sort: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.INTEGER,
  })
  category_id: number;
  @BelongsTo(() => Category, { onDelete: 'CASCADE' })
  category: Category;
}
