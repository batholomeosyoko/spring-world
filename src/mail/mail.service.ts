import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get('EMAIL_HOST'),
      port: this.config.get<number>('EMAIL_PORT'),
      secure: this.config.get('EMAIL_SECURE') === 'true',
      auth: {
        user: this.config.get('EMAIL_USER'),
        pass: this.config.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendOtpEmail(to: string, otp: string) {
    try {
      await this.transporter.sendMail({
        from: this.config.get('EMAIL_FROM'),
        to,
        subject: 'Your password reset code',
        text: `Your OTP code is ${otp}. It expires in 10 minutes.`,
        html: `<p>Your OTP code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
      });
    } catch (err) {
      this.logger.error(`Failed to send OTP email to ${to}: ${err.message}`);
    }
  }
}
