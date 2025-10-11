import { Controller, Request, Post, UseGuards, Body, Get, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req, @Body() loginDto: LoginDto) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('register')
  getRegister(@Res() res: Response) {
    return res.status(HttpStatus.METHOD_NOT_ALLOWED).json({
      message: 'GET method not allowed on /auth/register. Please use POST with registration data.',
    });
  }
}
