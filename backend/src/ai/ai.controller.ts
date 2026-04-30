import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { SummarizeRequestDto } from './dto/summarize-request.dto.js';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('summarize')
  summarize(@Body() body: SummarizeRequestDto) {
    return this.aiService.summarize(body.text);
  }
}