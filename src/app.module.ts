/*import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { User } from './entities/user.entity';

@Module({
  imports: [
     TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'your_username', // Replace with teammate's Postgres username
      password: 'your_password', // Replace with teammate's Postgres password
      database: 'your_database', // Replace with teammate's database name
      entities: [User],
      synchronize: true, // Auto-create tables (dev only)
    }),
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}*/
import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
