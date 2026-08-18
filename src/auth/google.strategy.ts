import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    } as any);
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails } = profile;
    const email = emails[0].value;

    let user = await this.userRepository.findOne({ where: { googleId: id } });

    if (!user) {
      user = await this.userRepository.findOne({ where: { email } });

      if (user) {
        user.googleId = id;
        await this.userRepository.save(user);
      } else {
        user = this.userRepository.create({
          googleId: id,
          email,
          name: `${name.givenName} ${name.familyName}`,
          password: null,
        });
        await this.userRepository.save(user);
      }
    }

    done(null, user);
  }
}
