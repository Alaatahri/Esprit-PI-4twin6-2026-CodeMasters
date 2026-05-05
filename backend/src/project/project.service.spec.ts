import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { ProjectService } from './project.service';

describe('ProjectService', () => {
  const projectModel: any = jest.fn();
  const userModel: any = jest.fn();

  const suiviProjectService = {
    findPublicPhotoUrlsForProject: jest.fn(),
  };

  let service: ProjectService;

  beforeEach(() => {
    jest.resetAllMocks();

    service = new ProjectService(
      projectModel,
      userModel,
      suiviProjectService as any,
    );

    suiviProjectService.findPublicPhotoUrlsForProject.mockResolvedValue([]);
  });

  it('create — succès', async () => {
    const clientId = new Types.ObjectId();

    const save = jest.fn().mockResolvedValue({
      _id: new Types.ObjectId(),
      clientId,
      titre: 'Projet test',
    });

    projectModel.mockImplementation(() => ({ save }));

    const dto = {
      clientId: clientId.toString(),
      titre: 'Projet test',
      description: 'Desc',
    };

    const result = await service.create(dto as any);

    expect(projectModel).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledTimes(1);

    const ctorPayload = projectModel.mock.calls[0][0];
    expect(ctorPayload.clientId.toString()).toBe(clientId.toString());
    expect(ctorPayload.statut).toBe('En attente');
    expect(ctorPayload.avancement_global).toBe(0);
    expect(ctorPayload.urgence).toBe('normal');

    expect(result).toEqual(
      expect.objectContaining({
        titre: 'Projet test',
        clientId,
      }),
    );
  });

  it('findAll — succès', async () => {
    const rows = [{ _id: new Types.ObjectId() }];

    const exec = jest.fn().mockResolvedValue(rows);
    const lean = jest.fn().mockReturnValue({ exec });
    const limit = jest.fn().mockReturnValue({ lean });
    const sort = jest.fn().mockReturnValue({ limit });

    projectModel.find = jest.fn().mockReturnValue({ sort });

    const result = await service.findAll(50);

    expect(projectModel.find).toHaveBeenCalledWith();
    expect(sort).toHaveBeenCalledWith({ createdAt: -1 });
    expect(limit).toHaveBeenCalledWith(50);
    expect(lean).toHaveBeenCalledTimes(1);
    expect(exec).toHaveBeenCalledTimes(1);
    expect(result).toBe(rows);
  });

  it('findOne — succès', async () => {
    const id = new Types.ObjectId().toString();
    const doc = { _id: id, titre: 'OK' };

    const exec = jest.fn().mockResolvedValue(doc);
    projectModel.findById = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({ exec }),
    });

    const result = await service.findOne(id);

    expect(projectModel.findById).toHaveBeenCalledWith(id);
    expect(result).toBe(doc);
  });

  it('update — succès', async () => {
    const id = new Types.ObjectId().toString();
    const updated = { _id: id, titre: 'Updated' };

    const exec = jest.fn().mockResolvedValue(updated);
    projectModel.findByIdAndUpdate = jest.fn().mockReturnValue({ exec });

    const result = await service.update(id, { titre: 'Updated' } as any);

    expect(projectModel.findByIdAndUpdate).toHaveBeenCalledWith(
      id,
      { titre: 'Updated' },
      { new: true },
    );
    expect(exec).toHaveBeenCalledTimes(1);
    expect(result).toBe(updated);
  });

  it('remove — succès', async () => {
    const id = new Types.ObjectId().toString();
    const deleted = { _id: id };

    const exec = jest.fn().mockResolvedValue(deleted);
    projectModel.findByIdAndDelete = jest.fn().mockReturnValue({ exec });

    const result = await service.remove(id);

    expect(projectModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    expect(exec).toHaveBeenCalledTimes(1);
    expect(result).toBe(deleted);
  });

  it('projet introuvable — exception métier', async () => {
    projectModel.findById = jest.fn().mockReturnValue({
      lean: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    const projectId = new Types.ObjectId().toString();
    const expertId = new Types.ObjectId().toString();

    await expect(
      service.appendExpertProjectPhotos(projectId, expertId, {
        urls: ['https://example.com/a.jpg'],
        album: 'avant',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
