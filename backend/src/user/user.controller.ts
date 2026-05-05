import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // ==================== ADMIN : validation des experts ====================
  @Get('admin/experts/pending')
  listPendingExperts() {
    return this.userService.listPendingExperts();
  }

  @Post('admin/experts/:id/approve')
  approveExpert(@Param('id') id: string) {
    return this.userService.approveExpert(id);
  }

  @Post('admin/experts/:id/reject')
  rejectExpert(@Param('id') id: string) {
    return this.userService.rejectExpert(id);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get('public/workers')
  findPublicWorkers() {
    return this.userService.findPublicWorkers();
  }

  @Get('public/:id/profile')
  getPublicProfile(@Param('id') id: string) {
    return this.userService.getPublicProfile(id);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const email = loginDto.email.trim();
      const mot_de_passe = loginDto.mot_de_passe;
      const user = await this.userService.login(email, mot_de_passe);
      if (!user) {
        return { success: false, message: 'Email ou mot de passe incorrect' };
      }
      if (typeof (user as any)?.blockedReason === 'string') {
        return { success: false, message: (user as any).blockedReason };
      }
      // Retourner un objet sérialisable (évite 500 avec ObjectId etc.)
      // On caste en any ici car les champs _id/createdAt viennent du document Mongo
      const dbUser: any = user;
      const safeUser = {
        _id: dbUser._id?.toString?.() ?? dbUser._id,
        prenom: dbUser.prenom,
        nom: dbUser.nom,
        email: dbUser.email,
        role: dbUser.role,
        telephone: dbUser.telephone,
        competences: dbUser.competences,
        avatarUrl: dbUser.avatarUrl,
        bio: dbUser.bio,
        expertApprovalStatus: dbUser.expertApprovalStatus,
        specialite: dbUser.specialite,
        experience_annees: dbUser.experience_annees,
        zones_travail: dbUser.zones_travail,
        createdAt: dbUser.createdAt,
      };
      return { success: true, user: safeUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erreur lors de la connexion' };
    }
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
