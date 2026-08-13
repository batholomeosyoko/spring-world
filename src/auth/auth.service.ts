import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    // TODO: generate + email a real OTP for forgotPasswordDto.email
    return { message: 'OTP sent to email' };
  }

  verifyOtp(verifyOtpDto: VerifyOtpDto) {
    // TODO: validate verifyOtpDto.otp against a stored OTP
    return { message: 'OTP verified' };
  }

  resetPassword(resetPasswordDto: ResetPasswordDto) {
    // TODO: hash resetPasswordDto.new_password and persist it
    return { message: 'Password reset successfully' };
  }
}
