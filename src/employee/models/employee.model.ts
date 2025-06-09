import { Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import { Comment } from 'src/comments/models/comment.model';

interface EmployeeAttr {
  full_name: string;
  birthday: string;
  phone_number: string;
  role: string;
}

@Table({ tableName: 'employee' })
export class Employee extends Model<Employee, EmployeeAttr> {
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
  full_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
    defaultValue: null,
  })
  birthday: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  phone_number: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  role: string;

    @HasMany(() => Comment, { onDelete: 'CASCADE' })
    comments: Comment;
}
