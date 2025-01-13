import { ApiProperty } from "@nestjs/swagger";

export class BackgroundCreateDto {
    @ApiProperty({example: "Image", description: "Background image"})
    image: any;
}