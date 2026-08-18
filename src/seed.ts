import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  // Create NestJS application context
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  // List of admin accounts to seed
  const admins = [
    {
      email: 'frankmayala072@gmail.com',
      password: 'newSecure789',
      name: 'Frank',
    },
    {
      email: 'john@example.com',
      password: 'password123',
      name: 'John Doe',
    },
  ];

  console.log('🌱 Seeding admin accounts...');

  for (const admin of admins) {
    // Check if user already exists
    const exists = await dataSource.query(
      'SELECT * FROM users WHERE email = $1',
      [admin.email]
    );

    if (exists.length === 0) {
      // Hash password and insert
      const hashedPassword = await bcrypt.hash(admin.password, 10);
      await dataSource.query(
        `INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt")
         VALUES (gen_random_uuid(), $1, $2, $3, 'admin', NOW(), NOW())`,
        [admin.email, hashedPassword, admin.name]
      );
      console.log(`✅ Admin created: ${admin.email}`);
    } else {
      console.log(`⏩ Admin already exists: ${admin.email}`);
    }
  }

  await app.close();
  console.log('✅ Seeding complete!');
  process.exit(0);
}

bootstrap().catch((error) => {
  console.error('❌ Seeding failed:', error);
  process.exit(1);
});