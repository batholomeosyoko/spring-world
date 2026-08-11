import {Injectable, NotFoundException} from '@nestjs/common';
import {randomUUID} from 'crypto';
import {createUserDto} from './dto/create-user.dto';
import {updateUserDto} from './dto/update-user.dto';
import {User} from './entities/user.entity';    

@Injectable()
export class UsersService {
  private users: User[] = [];
  
    create(createUserDto: createUserDto) {
      const user: User = {
        id: randomUUID(),
        ...createUserDto,
        password: (createUserDto as any).password,
        createdAt: new Date(),
      };
      this.users.push(user);
      return user;
    }
     
    findAll(): User[] {
      return this.users;
    }

    findOne(id: string): User {
      const user = this.users.find((user) => user.id === id);   
      if (!user) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      return user;
    }

    updtae(id: string, updateUserDto: updateUserDto): User {
      const user = this.findOne(id);
      Object.assign(user, updateUserDto);
      return user;
    }

    remove(id: string): void {
      const index = this.users.findIndex((user) => user.id === id);
      if (index === -1) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      this.users.splice(index, 1);
    }

}


