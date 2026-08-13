import { PartialType } from '@nestjs/mapped-types';
import { createUserDto } from './create-user.dto';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class updateUserDto extends PartialType(createUserDto) {
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;
}