import { PartialType } from "@nestjs/swagger";
import { AdminCreateDto } from "./admin-create.dto";

export class ADminUpdateDto extends PartialType(AdminCreateDto){}