import { Column, DataType, Model, Table } from "sequelize-typescript";

interface BackgroundAttr {
    image: string;
}

@Table({tableName: "background"})
export class Background extends Model<Background, BackgroundAttr> {
    @Column({
        type: DataType.INTEGER,
        autoIncrement: true,
        primaryKey: true
    })
    id: number;

    @Column({
        type: DataType.STRING,
    })
    image: string;
}