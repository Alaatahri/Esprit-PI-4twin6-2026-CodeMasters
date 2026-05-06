import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateDevisDto } from './dto/create-devis.dto';
import { Devis, DevisDocument } from './schemas/devis.schema';
import { DevisItem, DevisItemDocument } from './schemas/devis-item.schema';
import { Facture, FactureDocument } from './schemas/facture.schema';

@Injectable()
export class DevisService {
  constructor(
    @InjectModel(Devis.name) private devisModel: Model<DevisDocument>,
    @InjectModel(DevisItem.name)
    private devisItemModel: Model<DevisItemDocument>,
    @InjectModel(Facture.name) private factureModel: Model<FactureDocument>,
  ) {}

  async create(dto: CreateDevisDto): Promise<Devis> {
    const expertRaw = dto.expertId || dto.artisanId;
    if (!expertRaw || !Types.ObjectId.isValid(expertRaw)) {
      throw new BadRequestException(
        'expertId ou artisanId doit être un identifiant MongoDB valide',
      );
    }

    const articles = dto.articles ?? [];
    const sumHt = articles.reduce((s, a) => {
      const line =
        a.total != null && Number.isFinite(Number(a.total))
          ? Number(a.total)
          : Number(a.quantite) * Number(a.prix_unitaire);
      return s + (Number.isFinite(line) ? line : 0);
    }, 0);

    const montant_total =
      dto.montant_total != null && Number.isFinite(Number(dto.montant_total))
        ? Math.max(0, Number(dto.montant_total))
        : sumHt;

    let statut = dto.statut;
    if (!statut) {
      statut = dto.envoyer ? 'envoyé' : 'brouillon';
    }

    const numero_devis = `DV-${new Date().getFullYear()}-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    const createdDevis = new this.devisModel({
      projectId: dto.projectId
        ? new Types.ObjectId(dto.projectId)
        : undefined,
      clientId: dto.clientId ? new Types.ObjectId(dto.clientId) : undefined,
      expertId: new Types.ObjectId(expertRaw),
      titre: dto.titre,
      description: dto.description,
      temp_client_nom: dto.temp_client_nom,
      temp_client_email: dto.temp_client_email,
      articles: articles.map((a) => ({
        nom: a.nom,
        quantite: Number(a.quantite),
        prix_unitaire: Number(a.prix_unitaire),
        total:
          a.total != null && Number.isFinite(Number(a.total))
            ? Number(a.total)
            : Number(a.quantite) * Number(a.prix_unitaire),
      })),
      delai_validite: dto.delai_validite ?? 30,
      numero_devis,
      montant_total,
      statut,
      date_creation: dto.date_creation ?? new Date(),
    });

    return createdDevis.save();
  }

  async findAll(): Promise<Devis[]> {
    return this.devisModel.find().exec();
  }

  async findByProject(projectId: string): Promise<Devis[]> {
    return this.devisModel.find({ projectId }).exec();
  }

  async findOne(id: string): Promise<Devis> {
    return this.devisModel.findById(id).exec();
  }

  /**
   * Acceptation client : statut → accepté + facture (idempotent si déjà accepté + facture).
   */
  async accepter(id: string): Promise<{ facture: Facture }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant de devis invalide');
    }
    const devis = await this.devisModel.findById(id).exec();
    if (!devis) {
      throw new NotFoundException('Devis introuvable');
    }
    if (devis.statut !== 'envoyé' && devis.statut !== 'accepté') {
      throw new BadRequestException(
        'Seul un devis envoyé peut être accepté par le client',
      );
    }

    const existingFacture = await this.factureModel
      .findOne({ devisId: devis._id })
      .exec();

    if (devis.statut === 'accepté') {
      if (existingFacture) {
        return { facture: existingFacture };
      }
      const facture = await this.createFactureFromDevis(devis);
      return { facture };
    }

    devis.statut = 'accepté';
    await devis.save();

    const facture =
      existingFacture ?? (await this.createFactureFromDevis(devis));
    return { facture };
  }

  /**
   * Refus client : statut → refusé (idempotent si déjà refusé).
   */
  async refuser(id: string): Promise<{ message: string }> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant de devis invalide');
    }
    const devis = await this.devisModel.findById(id).exec();
    if (!devis) {
      throw new NotFoundException('Devis introuvable');
    }
    if (devis.statut === 'refusé') {
      return { message: 'Devis déjà refusé' };
    }
    if (devis.statut !== 'envoyé') {
      throw new BadRequestException(
        'Seul un devis envoyé peut être refusé par le client',
      );
    }
    devis.statut = 'refusé';
    await devis.save();
    return { message: 'Devis refusé' };
  }

  private async createFactureFromDevis(
    devis: DevisDocument,
  ): Promise<FactureDocument> {
    const numero_facture = `FV-${new Date().getFullYear()}-${Date.now()
      .toString(36)
      .toUpperCase()
      .slice(-8)}`;
    const total = Number(devis.montant_total) || 0;
    const created = new this.factureModel({
      numero_facture,
      titre:
        devis.titre?.trim() ||
        `Facture suite au devis ${devis.numero_devis || ''}`.trim(),
      description: devis.description ?? '',
      articles: devis.articles ?? [],
      montant_total: total,
      montant_paye: 0,
      solde_du: total,
      statut: 'envoyée',
      date_facture: new Date(),
      date_echeance: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      projectId: devis.projectId,
      clientId: devis.clientId,
      artisanId: devis.expertId,
      devisId: devis._id,
      temp_client_nom: devis.temp_client_nom?.trim(),
      temp_client_email: (() => {
        const e = (devis.temp_client_email || '').trim().toLowerCase();
        return e || undefined;
      })(),
    });
    return created.save();
  }

  async update(id: string, updateDevisDto: Partial<Devis>): Promise<Devis> {
    return this.devisModel
      .findByIdAndUpdate(id, updateDevisDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<Devis> {
    // Also delete related items
    await this.devisItemModel.deleteMany({ devisId: id }).exec();
    return this.devisModel.findByIdAndDelete(id).exec();
  }

  // DevisItem methods
  async createItem(createItemDto: Partial<DevisItem>): Promise<DevisItem> {
    const createdItem = new this.devisItemModel(createItemDto);
    const savedItem = await createdItem.save();

    // Update devis montant_total
    await this.updateDevisTotal(createItemDto.devisId.toString());

    return savedItem;
  }

  async findItemsByDevis(devisId: string): Promise<DevisItem[]> {
    return this.devisItemModel.find({ devisId }).exec();
  }

  async updateItem(
    id: string,
    updateItemDto: Partial<DevisItem>,
  ): Promise<DevisItem> {
    const updatedItem = await this.devisItemModel
      .findByIdAndUpdate(id, updateItemDto, { new: true })
      .exec();

    if (updatedItem) {
      await this.updateDevisTotal(updatedItem.devisId.toString());
    }

    return updatedItem;
  }

  async removeItem(id: string): Promise<DevisItem> {
    const item = await this.devisItemModel.findById(id).exec();
    const deletedItem = await this.devisItemModel.findByIdAndDelete(id).exec();

    if (deletedItem && item) {
      await this.updateDevisTotal(item.devisId.toString());
    }

    return deletedItem;
  }

  private async updateDevisTotal(devisId: string): Promise<void> {
    const items = await this.devisItemModel.find({ devisId }).exec();
    const total = items.reduce(
      (sum, item) => sum + item.quantite * item.prix_unitaire,
      0,
    );
    await this.devisModel
      .findByIdAndUpdate(devisId, { montant_total: total })
      .exec();
  }
}
