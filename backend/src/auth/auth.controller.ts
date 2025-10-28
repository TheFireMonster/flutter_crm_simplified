import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { FirebaseRegisterDto } from './dto/firebase-register.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('firebase-register')
  async firebaseRegister(@Req() req, @Body() body: FirebaseRegisterDto) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Firebase token');
    }
    const idToken = authHeader.replace('Bearer ', '');
    return await this.authService.firebaseRegister(idToken, body.name);
  }

  @Post('firebase-login')
  async firebaseLogin(@Req() req) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing Firebase token');
    }
    const idToken = authHeader.replace('Bearer ', '');
    return await this.authService.firebaseLogin(idToken);
  }


}