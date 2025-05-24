import { IsNotEmpty, IsArray, ArrayNotEmpty, IsUrl } from "class-validator";


export class RegisterClientDto {
  @IsNotEmpty()
  name: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsUrl({}, { each: true })
  redirectUris: string[];
}
