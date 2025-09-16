import { Controller, Post, Body, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('firebase-register')
  async firebaseRegister(@Req() req, @Body() body: { name?: string }) {
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

  @Post('refresh-token')
  async refreshToken(@Body() body: { refresh_token: string }) {
    const result = await this.authService.refreshToken(body.refresh_token);
    if (!result) throw new UnauthorizedException('Invalid refresh token');
    return result;
  }
}