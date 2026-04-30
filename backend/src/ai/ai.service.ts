import { Injectable } from '@nestjs/common';

@Injectable()
export class AiService {
  summarize(text: string) {
    return {
      summary: 'test summary',
      actionItems: ['item1', 'item2', 'item3'],
    };
  }
}