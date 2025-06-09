import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from 'sequelize-typescript';
import { Employee } from 'src/employee/models/employee.model';

interface CommentAttr {
  target_type: 'restaurant' | 'employee';
  target_id: number;
  full_name: string;
  comment: string;
  rating: number;
}

@Table({ tableName: 'comments' })
export class Comment extends Model<Comment, CommentAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  target_type: 'restaurant' | 'employee';

  @ForeignKey(() => Employee)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: null,
  })
  target_id: number;
  @BelongsTo(() => Employee, { onDelete: 'CASCADE' })
  employee: Employee;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: 'Nomalum',
  })
  full_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  comment: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  rating: number;
}
