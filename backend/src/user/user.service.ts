import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomBytes } from 'crypto';
import {
  User,
  UserDocument,
  type WorkZone,
  type WorkZoneScope,
} from './schemas/user.schema';
import { ProjectService } from '../project/project.service';
import { MailService } from '../mail/mail.service';
import { MarketplaceService } from '../marketplace/marketplace.service';
import {
  createPasswordResetToken,
  verifyPasswordResetToken,
} from '../auth/password-reset-token';

type SafeUser = Omit<User, 'mot_de_passe'>;

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly projectService: ProjectService,
    private readonly mailService: MailService,
    private readonly marketplaceService: MarketplaceService,
  ) {}

  private generateEmailVerificationToken(): string {
    return randomBytes(24).toString('hex');
  }

  async create(createUserDto: Partial<User>): Promise<User> {
    const dto: any = { ...(createUserDto as any) };

    if (typeof dto.prenom === 'string') dto.prenom = dto.prenom.trim();
    if (typeof dto.nom === 'string') dto.nom = dto.nom.trim();
    if (typeof dto.email === 'string')
      dto.email = dto.email.trim().toLowerCase();
    if (typeof dto.telephone === 'string') dto.telephone = dto.telephone.trim();

    if (dto.telephone === '') delete dto.telephone;
    if (dto.prenom === '') delete dto.prenom;

    if (dto.role === 'artisan') {
      if (typeof dto.specialite === 'string')
        dto.specialite = dto.specialite.trim();
      if (!dto.specialite) {
        throw new Error('Spécialité requise pour un artisan');
      }

      if (dto.experience_annees !== undefined) {
        const n = Number(dto.experience_annees);
        if (!Number.isFinite(n) || n < 0) {
          throw new Error('Expérience invalide (années)');
        }
        dto.experience_annees = Math.floor(n);
      } else {
        throw new Error('Expérience requise pour un artisan');
      }

      dto.zones_travail = this.normalizeWorkZones(dto.zones_travail);
      if (!dto.zones_travail || dto.zones_travail.length === 0) {
        throw new Error('Zones de travail requises pour un artisan');
      }
    } else {
      // Normalisation optionnelle si fourni
      if (dto.zones_travail !== undefined) {
        dto.zones_travail = this.normalizeWorkZones(dto.zones_travail);
      }
    }

    // Email verification token (utilisé par /api/auth/verify-email)
    if (!dto.emailVerified) {
      dto.emailVerified = false;
    }
    if (!dto.emailVerificationToken) {
      dto.emailVerificationToken = this.generateEmailVerificationToken();
    }

    // Workflow Expert: par défaut on met en attente d'approbation admin.
    if (String(dto.role || '').toLowerCase() === 'expert') {
      if (!dto.expertApprovalStatus) {
        dto.expertApprovalStatus = 'pending';
      }
    }

    const createdUser = new this.userModel(dto);
    const saved = await createdUser.save();

    // Envoi e-mail (si configuré). En dev sans SMTP, on n’empêche pas la création.
    try {
      if (this.mailService.isConfigured() || process.env.USE_ETHEREAL_IN_DEV?.trim() === 'true') {
        await this.mailService.sendVerificationEmail({
          to: saved.email,
          nom: saved.nom || '',
          token: String((saved as any).emailVerificationToken || ''),
        });
      }
    } catch {
      // ne bloque pas l’inscription en dev / environnement non configuré
    }

    return saved;
  }

  private normalizeWorkZones(raw: unknown): WorkZone[] {
    const arr: any[] = Array.isArray(raw) ? raw : raw ? [raw as any] : [];

    const allowedScopes: WorkZoneScope[] = [
      'tn_all',
      'tn_city',
      'country',
      'world',
    ];
    const out: WorkZone[] = [];

    for (const item of arr) {
      if (!item) continue;

      const scope = item.scope as WorkZoneScope;
      if (!scope || !allowedScopes.includes(scope)) continue;

      const value =
        typeof item.value === 'string' ? item.value.trim() : undefined;

      // value requis pour tn_city et country
      if ((scope === 'tn_city' || scope === 'country') && !value) continue;

      out.push(value ? { scope, value } : { scope });
    }

    // Déduplication simple
    const seen = new Set<string>();
    const deduped: WorkZone[] = [];
    for (const z of out) {
      const key = `${z.scope}:${z.value ?? ''}`.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      deduped.push(z);
    }

    return deduped;
  }

  async findAll(limit = 100): Promise<User[]> {
    return this.userModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  /** Artisans et experts pour la page d'accueil (sans mot de passe ni email). */
  async findPublicWorkers(limit = 48): Promise<Record<string, unknown>[]> {
    const users = await this.userModel
      .find({
        $or: [
          { role: 'artisan' },
          { role: 'expert', expertApprovalStatus: 'approved' },
        ],
      })
      .select('-mot_de_passe -email')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return users as Record<string, unknown>[];
  }

  /** Profil public + historique projets + avis extraits des projets. */
  async getPublicProfile(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Profil introuvable');
    }
    const user = await this.userModel
      .findById(id)
      .select('-mot_de_passe -email')
      .lean()
      .exec();
    if (
      !user ||
      !['artisan', 'expert'].includes((user as { role?: string }).role || '')
    ) {
      throw new NotFoundException('Profil introuvable');
    }

    const role = (user as { role: string }).role;
    const projects =
      role === 'expert'
        ? await this.projectService.findByExpertId(id)
        : await this.projectService.findAcceptedByArtisan(id);

    type Review = {
      projetId: string;
      projetTitre: string;
      note?: number;
      commentaire?: string;
      kind: 'client' | 'artisan' | 'expert' | 'marketplace';
      authorLabel?: string;
      date_avis?: Date | string;
    };
    const reviews: Review[] = [];

    for (const p of projects) {
      const pid = String((p as { _id?: Types.ObjectId })._id ?? '');
      const titre = p.titre;
      if (p.clientComment && String(p.clientComment).trim()) {
        reviews.push({
          projetId: pid,
          projetTitre: titre,
          note: p.clientRating,
          commentaire: p.clientComment,
          kind: 'client',
        });
      }
      if (role === 'artisan' && typeof p.artisanRating === 'number') {
        reviews.push({
          projetId: pid,
          projetTitre: titre,
          note: p.artisanRating,
          kind: 'artisan',
        });
      }
      if (role === 'expert' && typeof p.expertRating === 'number') {
        reviews.push({
          projetId: pid,
          projetTitre: titre,
          note: p.expertRating,
          kind: 'expert',
        });
      }
    }

    const marketplaceAvis =
      await this.marketplaceService.getAvisForWorkerPublicProfile(id);
    for (const doc of marketplaceAvis) {
      const row = doc as unknown as {
        note?: number;
        commentaire?: string;
        type?: string;
        date_avis?: Date;
        createdAt?: Date;
        clientId?:
          | { nom?: string; prenom?: string }
          | Types.ObjectId
          | string
          | null;
      };
      const c = row.clientId as { nom?: string; prenom?: string } | undefined;
      const authorLabel =
        c && typeof c === 'object' && 'nom' in c
          ? [c.prenom, c.nom].filter(Boolean).join(' ').trim() ||
            c.nom ||
            'Client'
          : 'Client';
      reviews.push({
        projetId: '__marketplace__',
        projetTitre:
          row.type === 'livreur'
            ? 'Marketplace — delivery'
            : 'Marketplace — professional',
        note: row.note,
        commentaire:
          typeof row.commentaire === 'string' ? row.commentaire : '',
        kind: 'marketplace',
        authorLabel,
        date_avis: row.date_avis ?? row.createdAt,
      });
    }

    const completedCount = projects.filter(
      (p) => p.statut === 'Terminé',
    ).length;

    return {
      user,
      stats: {
        projectCount: projects.length,
        completedCount,
      },
      projects: projects.map((p) => ({
        _id: (p as { _id?: Types.ObjectId })._id,
        titre: p.titre,
        description: p.description,
        statut: p.statut,
        avancement_global: p.avancement_global,
        date_debut: p.date_debut,
        date_fin_prevue: p.date_fin_prevue,
        clientRating: p.clientRating,
        clientComment: p.clientComment,
        expertRating: p.expertRating,
        artisanRating: p.artisanRating,
      })),
      reviews,
    };
  }

  async findOne(id: string): Promise<User> {
    return this.userModel.findById(id).lean().exec();
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }

  async login(email: string, mot_de_passe: string): Promise<SafeUser | null> {
    try {
      const user = await this.userModel
        .findOne({ email })
        .select('+mot_de_passe')
        .lean()
        .exec();
      if (!user) return null;
      if (user.mot_de_passe !== mot_de_passe) return null;

      // Bloquer l'accès expert tant que non approuvé
      if (
        String((user as any).role || '').toLowerCase() === 'expert' &&
        (user as any).expertApprovalStatus &&
        (user as any).expertApprovalStatus !== 'approved'
      ) {
        return {
          ...(user as any),
          mot_de_passe: undefined,
          blockedReason:
            (user as any).expertApprovalStatus === 'rejected'
              ? 'Votre compte expert a été refusé.'
              : 'Votre compte expert est en attente de validation.',
        } as any;
      }

      const rest = { ...(user as Record<string, unknown>) };
      delete (rest as { mot_de_passe?: string }).mot_de_passe;
      return rest as SafeUser;
    } catch (error) {
      console.error('Login error:', error);
      return null;
    }
  }

  // ==================== ADMIN : validation experts ====================
  async listPendingExperts(limit = 50): Promise<Record<string, unknown>[]> {
    const users = await this.userModel
      .find({ role: 'expert', expertApprovalStatus: 'pending' })
      .select('-mot_de_passe')
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean()
      .exec();
    return users as Record<string, unknown>[];
  }

  async approveExpert(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Expert introuvable');
    }
    const u = await this.userModel
      .findByIdAndUpdate(
        id,
        { expertApprovalStatus: 'approved' },
        { new: true },
      )
      .select('-mot_de_passe')
      .lean()
      .exec();
    if (!u) throw new NotFoundException('Expert introuvable');
    return { success: true, user: u };
  }

  async rejectExpert(id: string) {
    if (!Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Expert introuvable');
    }
    const u = await this.userModel
      .findByIdAndUpdate(
        id,
        { expertApprovalStatus: 'rejected' },
        { new: true },
      )
      .select('-mot_de_passe')
      .lean()
      .exec();
    if (!u) throw new NotFoundException('Expert introuvable');
    return { success: true, user: u };
  }

  async update(id: string, updateUserDto: Partial<User>): Promise<User> {
    return this.userModel
      .findByIdAndUpdate(id, updateUserDto, { new: true })
      .exec();
  }

  async remove(id: string): Promise<User> {
    return this.userModel.findByIdAndDelete(id).exec();
  }

  async verifyEmailByToken(token: string) {
    const t = typeof token === 'string' ? token.trim() : '';
    if (!t) {
      throw new BadRequestException('Token manquant');
    }

    const user = await this.userModel.findOne({ emailVerificationToken: t }).exec();
    if (!user) {
      throw new NotFoundException('Token invalide ou expiré');
    }

    (user as any).emailVerified = true;
    (user as any).emailVerificationToken = undefined;
    await user.save();

    return { success: true };
  }

  async forgotPassword(email?: string) {
    const e = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!e) {
      throw new BadRequestException('Email manquant');
    }

    const user = await this.userModel.findOne({ email: e }).exec();
    // Toujours répondre "ok" pour ne pas exposer si l'email existe.
    if (!user) {
      return { success: true };
    }

    const token = createPasswordResetToken(e);

    try {
      if (this.mailService.isConfigured() || process.env.USE_ETHEREAL_IN_DEV?.trim() === 'true') {
        await this.mailService.sendPasswordResetEmail({ to: e, token });
      }
    } catch {
      // en dev / env non configuré on laisse passer
    }

    return { success: true };
  }

  async resetPassword(args: {
    token?: string;
    newPassword?: string;
    confirmPassword?: string;
  }) {
    const token = typeof args?.token === 'string' ? args.token.trim() : '';
    const newPassword =
      typeof args?.newPassword === 'string' ? args.newPassword : '';
    const confirmPassword =
      typeof args?.confirmPassword === 'string' ? args.confirmPassword : '';

    if (!token) throw new BadRequestException('Token manquant');
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Mot de passe invalide (6 caractères minimum)');
    }
    if (newPassword !== confirmPassword) {
      throw new BadRequestException('Les mots de passe ne correspondent pas');
    }

    const verified = verifyPasswordResetToken(token);
    if (!verified) {
      throw new BadRequestException('Token invalide ou expiré');
    }

    const user = await this.userModel
      .findOne({ email: verified.email })
      .select('+mot_de_passe')
      .exec();
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    user.mot_de_passe = newPassword;
    await user.save();

    return { success: true };
  }
}
