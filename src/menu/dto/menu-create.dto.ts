import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsInt } from "class-validator";

export class MenuCreateDto {
    @ApiProperty({example: "Name", description: "Menu name"})
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({example: "1000", description: "Menu price"})
    @IsString()
    @IsNotEmpty()
    price: string;

    @ApiProperty({example: "60", description: "Menu discount"})
    @IsString()
    discount: string;

    @ApiProperty({example: "true or false", description: "Menu type"})
    type: boolean;

    @ApiProperty({example: "true or false", description: "Menu new"})
    new: boolean;

    @ApiProperty({example: "Info", description: "Menu description"})
    description: string;

    @ApiProperty({example: "Image", description: "Menu image"})
    image: any;

    @ApiProperty({example: 1, description: "Menu sort"})
    sort: number;

    @ApiProperty({example: 1, description: "Category ID"})
    @IsNotEmpty()
    category_id: number;
}
