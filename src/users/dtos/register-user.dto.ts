import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @IsOptional()
  @Length(3, 150)
  username?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(250)
  email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  password: string;
}
