import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  async summarize(text: string) {
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
- No markdown, no extra keys, no explanation text.
Input text:
${text}
`.trim();

    let response: OpenAI.Responses.Response;
    try {
      response = await this.openai.responses.create({
        model,
        input: prompt,
      });
    } catch {
      throw new BadGatewayException('Failed to reach AI provider.');
    }

    const output = response.output_text?.trim();
    if (!output) {
      throw new BadGatewayException('AI model returned empty output.');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(output);
    } catch {
      throw new BadGatewayException('AI model returned invalid JSON.');
    }

    if (
      !parsed ||
      typeof parsed !== 'object' ||
      !('summary' in parsed) ||
      !('actionItems' in parsed)
    ) {
      throw new BadGatewayException('AI response is missing required fields.');
    }

    const summary = (parsed as { summary: unknown }).summary;
    const actionItems = (parsed as { actionItems: unknown }).actionItems;

    if (typeof summary !== 'string' || !Array.isArray(actionItems)) {
      throw new BadGatewayException('AI response shape is invalid.');
    }

    if (
      actionItems.length !== 3 ||
      actionItems.some((item) => typeof item !== 'string' || !item.trim())
    ) {
      throw new BadGatewayException(
        'AI response must contain exactly 3 non-empty action items.',
      );
    }

    return {
      summary: summary.trim(),
      actionItems: actionItems.map((item) => item.trim()),
    };
  }
}