import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('openai')
export class OpenaiController {
  constructor(private openai: OpenaiService) {}

  // For demo we will not wire a full passport-jwt guard; expect Authorization header with valid token
  @UseGuards(AuthGuard('jwt'))
  @Post('chat')
  async chat(@Request() req: any, @Body('prompt') prompt: string) {
    const userId = req.user?.sub || 'anonymous';
    return this.openai.chat(userId, prompt);
  }
}
