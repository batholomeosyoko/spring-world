import {PartialType} from '@nestjs/mapped-types';
import { createUserDto } from './create-user.dto';

export class updateUserDto extends PartialType(createUserDto) {}