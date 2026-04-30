import { BadGatewayException, InternalServerErrorException } from '@nestjs/common';
import { AiService } from './ai.service';

describe('AiService', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;
  const originalModel = process.env.OPENAI_MODEL;

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
    process.env.OPENAI_MODEL = originalModel;
    jest.restoreAllMocks();
  });

  it('returns parsed summary and action items when provider output is valid', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_MODEL = 'test-model';

    const service = new AiService();
    const createMock = jest.fn().mockResolvedValue({
      output_text: JSON.stringify({
        summary: 'Launch preparation is underway.',
        actionItems: [
          'Finalize the API changes.',
          'Review the UI updates.',
          'Run QA tests before release.',
        ],
      }),
    });
    (service as any).openai.responses.create = createMock;

    const result = await service.summarize('Test input text for summary.');

    expect(result).toEqual({
      summary: 'Launch preparation is underway.',
      actionItems: [
        'Finalize the API changes.',
        'Review the UI updates.',
        'Run QA tests before release.',
      ],
    });
    expect(createMock).toHaveBeenCalledTimes(2);
  });

  it('throws InternalServerErrorException when required env vars are missing', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    delete process.env.OPENAI_MODEL;

    const service = new AiService();

    await expect(service.summarize('Anything')).rejects.toBeInstanceOf(
      InternalServerErrorException,
    );
  });

  it('throws BadGatewayException when provider returns invalid JSON twice', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_MODEL = 'test-model';

    const service = new AiService();
    const createMock = jest
      .fn()
      .mockResolvedValueOnce({ output_text: 'not json' })
      .mockResolvedValueOnce({ output_text: 'still not json' });
    (service as any).openai.responses.create = createMock;

    await expect(service.summarize('Input')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(createMock).toHaveBeenCalledTimes(2);
  });

  it('refines action items when initial output has chained tasks', async () => {
    process.env.OPENAI_API_KEY = 'test-key';
    process.env.OPENAI_MODEL = 'test-model';

    const service = new AiService();
    const createMock = jest
      .fn()
      .mockResolvedValueOnce({
        output_text: JSON.stringify({
          summary: 'Release prep is in progress.',
          actionItems: [
            'Finalize API and review UI and update docs.',
            'Notify stakeholders and prepare deployment scripts.',
            'Run QA and monitor logs after release.',
          ],
        }),
      })
      .mockResolvedValueOnce({
        output_text: JSON.stringify({
          summary: 'Release prep is in progress.',
          actionItems: [
            'Finalize the API implementation.',
            'Review the UI updates.',
            'Prepare deployment scripts for release.',
          ],
        }),
      })
      .mockResolvedValueOnce({
        output_text: JSON.stringify({
          actionItems: [
            'Finalize the API implementation.',
            'Review the UI updates.',
            'Prepare deployment scripts for release.',
          ],
        }),
      });
    (service as any).openai.responses.create = createMock;

    const result = await service.summarize('Complex input text');

    expect(result).toEqual({
      summary: 'Release prep is in progress.',
      actionItems: [
        'Finalize the API implementation.',
        'Review the UI updates.',
        'Prepare deployment scripts for release.',
      ],
    });
    expect(createMock).toHaveBeenCalledTimes(3);
  });
});
