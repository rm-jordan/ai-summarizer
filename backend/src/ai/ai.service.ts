import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { SummarizeResponseDto } from './dto/summarize-response.dto.js';

@Injectable()
export class AiService {
  private static readonly PROVIDER_ERROR_MESSAGE =
    'Failed to get a valid structured response from AI provider.';

  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async summarize(text: string): Promise<SummarizeResponseDto> {
    const model = process.env.OPENAI_MODEL;

    if (!process.env.OPENAI_API_KEY || !model) {
      throw new InternalServerErrorException(
        'Missing OPENAI_API_KEY or OPENAI_MODEL configuration.',
      );
    }

    const prompt = `
You are a concise assistant.
Return ONLY valid JSON with this exact shape:
{
  "summary": "short summary",
  "actionItems": ["action item 1", "action item 2", "action item 3"]
}

Rules:
- "summary" must be a short plain-English summary of the input text.
- "actionItems" must contain exactly 3 concrete action-oriented strings.
- Each action item must be one focused task (not multiple tasks chained together).
- Start each action item with an action verb (for example: Finalize, Review, Notify).
- Keep each action item concise (around 8-16 words).
- Do not combine separate tasks with "and" unless they are part of one atomic task.
- No markdown, no extra keys, no explanation text.
Input text:
${text}
`.trim();

    const output = await this.requestStructuredOutput(model, prompt);
    return this.parseAndValidateResponse(output);
  }

  private async requestStructuredOutput(
    model: string,
    prompt: string,
  ): Promise<string> {
    // Retry once with stronger instructions if first output is malformed.
    const outputs: string[] = [];

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const attemptPrompt =
        attempt === 0
          ? prompt
          : `${prompt}\n\nReturn JSON only. Do not include markdown fences or any extra text.`;
      let response: OpenAI.Responses.Response;
      try {
        response = await this.openai.responses.create({
          model,
          input: attemptPrompt,
        });
      } catch {
        throw new BadGatewayException(AiService.PROVIDER_ERROR_MESSAGE);
      }

      const output = response.output_text?.trim();
      if (output) {
        outputs.push(output);
      }
    }

    if (outputs.length === 0) {
      throw new BadGatewayException(AiService.PROVIDER_ERROR_MESSAGE);
    }

    for (const output of outputs) {
      try {
        JSON.parse(output);
        return output;
      } catch {
        // try next output if available
      }
    }

    throw new BadGatewayException(AiService.PROVIDER_ERROR_MESSAGE);
  }

  private parseAndValidateResponse(output: string): SummarizeResponseDto {
    const parsed = JSON.parse(output) as Record<string, unknown>;

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('summary' in parsed) ||
      !('actionItems' in parsed)
    ) {
      throw new BadGatewayException(AiService.PROVIDER_ERROR_MESSAGE);
    }

    const summary = parsed.summary;
    const actionItems = parsed.actionItems;

    if (typeof summary !== 'string' || !Array.isArray(actionItems)) {
      throw new BadGatewayException(AiService.PROVIDER_ERROR_MESSAGE);
    }

    if (
      actionItems.length !== 3 ||
      actionItems.some((item) => typeof item !== 'string' || !item.trim())
    ) {
      throw new BadGatewayException(AiService.PROVIDER_ERROR_MESSAGE);
    }

    return {
      summary: summary.trim(),
      actionItems: actionItems.map((item) => item.trim()),
    };
  }
}