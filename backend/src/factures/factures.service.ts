import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Facture, FactureDocument } from '../devis/schemas/facture.schema';

@Injectable()
export class FacturesService {
  constructor(
    @InjectModel(Facture.name) private factureModel: Model<FactureDocument>,
  ) {}

  /**
   * Liste des factures visibles par l’utilisateur.
   * - Si `projectId` est fourni : inclut aussi les factures sans projet (souvent créées à partir d’un devis sans liaison projet).
   * - Sinon toutes les factures du périmètre utilisateur.
   */
  async findForUser(
    userId?: string,
    role?: string,
    userEmail?: string,
    projectId?: string,
  ): Promise<Facture[]> {
    const and: Record<string, unknown>[] = [];

    if (projectId && Types.ObjectId.isValid(projectId)) {
      const pid = new Types.ObjectId(projectId);
      and.push({
        $or: [
          { projectId: pid },
          { projectId: null },
          { projectId: { $exists: false } },
        ],
      });
    }

    const r = (role || '').toLowerCase();
    if (r === 'admin') {
      const filter = and.length ? { $and: and } : {};
      return this.factureModel.find(filter).sort({ createdAt: -1 }).exec();
    }

    const trimmedId = (userId || '').trim();
    const idOk = Boolean(trimmedId && Types.ObjectId.isValid(trimmedId));
    const uid = idOk ? new Types.ObjectId(trimmedId) : null;

    if (r === 'client') {
      const email = (userEmail || '').trim().toLowerCase();
      const clientOr: Record<string, unknown>[] = [];
      if (uid) {
        clientOr.push(
          { clientId: uid },
          /** tolère une chaîne hex si la base a été peuplée sans cast ObjectId */
          { clientId: trimmedId },
        );
      }
      if (email) {
        clientOr.push({
          temp_client_email: new RegExp(
            `^${email.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`,
            'i',
          ),
        });
      }
      /** Sans _id valide mais avec email : toujours lister via temp_client_email */
      if (clientOr.length === 0) {
        return [];
      }
      and.push({ $or: clientOr });
    } else {
      if (!uid) {
        return [];
      }
      if (r === 'expert' || r === 'artisan') {
        and.push({
          $or: [{ artisanId: uid }, { artisanId: trimmedId }],
        });
      } else {
        and.push({
          $or: [
            { clientId: uid },
            { clientId: trimmedId },
            { artisanId: uid },
            { artisanId: trimmedId },
          ],
        });
      }
    }

    const filter = and.length ? { $and: and } : {};
    return this.factureModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Facture | null> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Identifiant invalide');
    }
    return this.factureModel.findById(id).exec();
  }

  async getPaiements(factureId: string): Promise<Facture['paiements']> {
    if (!Types.ObjectId.isValid(factureId)) {
      throw new BadRequestException('Identifiant invalide');
    }
    const doc = await this.factureModel
      .findById(factureId)
      .select('paiements')
      .lean()
      .exec();
    return (doc as { paiements?: Facture['paiements'] })?.paiements ?? [];
  }

  async recordPaiement(
    factureId: string,
    body: {
      montant?: number;
      methode_paiement?: string;
      details?: Record<string, unknown>;
    },
  ): Promise<Facture> {
    if (!Types.ObjectId.isValid(factureId)) {
      throw new BadRequestException('Identifiant invalide');
    }
    const m = Number(body.montant);
    if (!Number.isFinite(m) || m <= 0) {
      throw new BadRequestException('Montant invalide');
    }

    const doc = await this.factureModel.findById(factureId).exec();
    if (!doc) {
      throw new NotFoundException('Facture introuvable');
    }

    if (!doc.paiements) doc.paiements = [];
    doc.paiements.push({
      montant: m,
      methode_paiement: body.methode_paiement || 'virement',
      details: body.details,
      createdAt: new Date(),
    });

    const prevPaye = Number(doc.montant_paye) || 0;
    doc.montant_paye = Math.min(doc.montant_total, prevPaye + m);
    doc.solde_du = Math.max(0, doc.montant_total - doc.montant_paye);

    if (doc.solde_du <= 0.001) {
      doc.statut = 'payée';
    } else if (doc.montant_paye > 0) {
      doc.statut = 'partiellement_payée';
    }

    return doc.save();
  }
}
