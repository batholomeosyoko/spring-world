import { IsIn, IsNotEmpty } from 'class-validator';

export class UpdateRoleDto {
  @IsNotEmpty()
  @IsIn(['admin', 'user'])
  role: 'admin' | 'user';
}
