import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(loginDto: LoginDto) {
    // Mock user for now - will be replaced with DB later
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      password: '$2b$10$examplehashedpassword',
    };

    // For demo, accept any credentials
    if (loginDto.email === 'test@test.com' && loginDto.password === '123') {
      const payload = { email: mockUser.email, sub: mockUser.id };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }

    throw new UnauthorizedException('Invalid credentials');
  }

  forgotPassword() {
    return { message: 'OTP sent to email' };
  }

  verifyOtp() {
    return { message: 'OTP verified' };
  }

  resetPassword() {
    return { message: 'Password reset successfully' };
  }
}
