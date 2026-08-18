import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, type: 'varchar' })
  @Exclude()
  password: string | null;

  @Column({ nullable: true })
  name: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'user'],
    default: 'user',
  })
  role: 'admin' | 'user';

  @Column({ nullable: true, unique: true, type: 'varchar' })
  googleId: string | null;

  @Column({ nullable: true, type: 'varchar' })
  @Exclude()
  otp: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  @Exclude()
  otpExpiry: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
