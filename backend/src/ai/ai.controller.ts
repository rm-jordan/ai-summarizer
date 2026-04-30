import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize')
  summarize(@Body() body: { text: string }) {
    return this.aiService.summarize(body.text);
  }
}