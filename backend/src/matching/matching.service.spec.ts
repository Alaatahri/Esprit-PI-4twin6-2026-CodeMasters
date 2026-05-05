import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { MatchingService } from './matching.service';

jest.mock('./services/projectAnalysisService', () => ({
  analyzeProject: jest.fn(),
}));

jest.mock('./services/matchingService', () => ({
  findBestExperts: jest.fn(),
}));

import { analyzeProject } from './services/projectAnalysisService';
import { findBestExperts } from './services/matchingService';

describe('MatchingService', () => {
  const matchingRequestModel: any = jest.fn();
  const projectModel: any = jest.fn();
  const userModel: any = jest.fn();
  const proposalModel: any = jest.fn();

  const inAppNotificationService = {
    createMany: jest.fn(),
  };

  let service: MatchingService;

  beforeEach(() => {
    jest.resetAllMocks();

    service = new MatchingService(
      matchingRequestModel,
      projectModel,
      userModel,
      proposalModel,
      inAppNotificationService as any,
    );

    matchingRequestModel.updateMany = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue({}),
    });

    matchingRequestModel.insertMany = jest.fn().mockResolvedValue([]);
    matchingRequestModel.find = jest.fn();

    inAppNotificationService.createMany.mockResolvedValue(undefined);
  });

  it('triggerMatching — trouve des experts (succès)', async () => {
    const projectId = new Types.ObjectId().toString();

    const save = jest.fn().mockResolvedValue(undefined);
    const projectDoc: any = {
      _id: new Types.ObjectId(projectId),
      titre: 'Rénovation électrique',
      description: 'Travaux tableau électrique et prises',
      save,
      schema: { path: jest.fn().mockReturnValue(false) },
    };

    projectModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(projectDoc),
    });

    (analyzeProject as jest.Mock).mockResolvedValue({
      complexity: 'medium',
      requiredCompetences: ['électricité'],
    });

    const expertId = new Types.ObjectId();
    (findBestExperts as jest.Mock).mockResolvedValue([
      {
        _id: expertId,
        prenom: 'Sara',
        nom: 'Expert',
        email: 'sara@example.com',
        competences: ['électricité'],
        score: 88.5,
      },
    ]);

    matchingRequestModel.find.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    matchingRequestModel.find.mockReturnValueOnce({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([
            {
              _id: new Types.ObjectId(),
              expertId,
              status: 'pending',
            },
          ]),
        }),
      }),
    });

    userModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const result = await service.triggerMatching(projectId);

    expect(analyzeProject).toHaveBeenCalled();
    expect(findBestExperts).toHaveBeenCalled();

    expect(result.matchedExperts?.length).toBeGreaterThanOrEqual(1);
    expect(result.matchedExperts?.[0]?._id?.toString?.()).toBe(expertId.toString());
    expect(result.matchedExperts?.[0]?.score).toBe(88.5);

    expect(matchingRequestModel.insertMany).toHaveBeenCalled();
    expect(inAppNotificationService.createMany).toHaveBeenCalled();
  });

  it('calculate matching score — succès (via findBestExperts mock)', async () => {
    const projectId = new Types.ObjectId().toString();

    const save = jest.fn().mockResolvedValue(undefined);
    const projectDoc: any = {
      _id: new Types.ObjectId(projectId),
      titre: 'Peinture murale',
      description: 'Peinture des murs salon',
      save,
      schema: { path: jest.fn().mockReturnValue(false) },
    };

    projectModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(projectDoc),
    });

    (analyzeProject as jest.Mock).mockResolvedValue({
      complexity: 'simple',
      requiredCompetences: ['peinture'],
    });

    (findBestExperts as jest.Mock).mockResolvedValue([
      {
        _id: new Types.ObjectId(),
        score: 72.3,
      },
    ]);

    matchingRequestModel.find.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    matchingRequestModel.find.mockReturnValueOnce({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    userModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const result = await service.triggerMatching(projectId);

    expect(result.matchedExperts?.[0]?.score).toBe(72.3);
  });

  it('triggerMatching — aucun expert matché (liste vide)', async () => {
    const projectId = new Types.ObjectId().toString();

    const save = jest.fn().mockResolvedValue(undefined);
    const projectDoc: any = {
      _id: new Types.ObjectId(projectId),
      titre: 'Projet',
      description: 'Sans analyse utile',
      save,
      schema: { path: jest.fn().mockReturnValue(false) },
    };

    projectModel.findById = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(projectDoc),
    });

    (analyzeProject as jest.Mock).mockResolvedValue({
      complexity: 'simple',
      requiredCompetences: [],
    });

    (findBestExperts as jest.Mock).mockResolvedValue([]);

    matchingRequestModel.find.mockReturnValueOnce({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    matchingRequestModel.find.mockReturnValueOnce({
      sort: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    userModel.find = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([]),
        }),
      }),
    });

    const result = await service.triggerMatching(projectId);

    expect(result.matchedExperts).toEqual([]);
    expect(matchingRequestModel.insertMany).not.toHaveBeenCalled();
    expect(inAppNotificationService.createMany).not.toHaveBeenCalled();
  });

  it('triggerMatching — ID projet invalide', async () => {
    await expect(service.triggerMatching('not-an-objectid')).rejects.toBeInstanceOf(
      BadRequestException,
    );

    expect(projectModel.findById).not.toHaveBeenCalled();
    expect(analyzeProject).not.toHaveBeenCalled();
    expect(findBestExperts).not.toHaveBeenCalled();
  });
});
