import { Test, TestingModule } from '@nestjs/testing';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

describe('AiController', () => {
  let controller: AiController;
  let aiService: { summarize: jest.Mock };

  beforeEach(async () => {
    aiService = {
      summarize: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiController],
      providers: [
        {
          provide: AiService,
          useValue: aiService,
        },
      ],
    }).compile();

    controller = module.get<AiController>(AiController);
  });

  it('returns summarize response from service', async () => {
    const text = 'Finalize API, review UI, and run QA before release.';
    const mockedResponse = {
      summary: 'Team is preparing final release activities.',
      actionItems: [
        'Finalize the API updates.',
        'Review the UI changes.',
        'Run QA tests before release.',
      ],
    };
    aiService.summarize.mockResolvedValue(mockedResponse);

    await expect(controller.summarize({ text })).resolves.toEqual(mockedResponse);
    expect(aiService.summarize).toHaveBeenCalledWith(text);
    expect(aiService.summarize).toHaveBeenCalledTimes(1);
  });
});
