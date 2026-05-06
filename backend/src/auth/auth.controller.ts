import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserService } from '../user/user.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { CvAnalysisService } from './cv-analysis.service';
import { AuthTokensService } from './auth-tokens.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly userService: UserService,
    private readonly cvAnalysisService: CvAnalysisService,
    private readonly authTokens: AuthTokensService,
  ) {}

  @Get('verify-email')
  async verifyEmail(@Query('token') token: string) {
    const t = typeof token === 'string' ? token.trim() : '';
    if (!t) {
      throw new BadRequestException('Token manquant');
    }
    return this.userService.verifyEmailByToken(t);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.userService.forgotPassword(body?.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: ResetPasswordDto) {
    return this.userService.resetPassword({
      token: body?.token,
      newPassword: body?.newPassword,
      confirmPassword: body?.confirmPassword,
    });
  }

  @Post('refresh')
  async refresh(@Body() body: RefreshTokenDto) {
    const token = body.refreshToken?.trim();
    if (!token) throw new BadRequestException('refreshToken requis');
    let sub: string;
    try {
      ({ sub } = await this.authTokens.verifyRefresh(token));
    } catch {
      throw new UnauthorizedException('Session expirée ou invalide');
    }
    const user = await this.userService.findOne(sub);
    const doc = user as unknown as Record<string, unknown> | null;
    if (!doc || doc._id == null) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }
    const role = String(doc.role || '').toLowerCase();
    const approval = doc.expertApprovalStatus;
    if (
      role === 'expert' &&
      approval &&
      typeof approval === 'string' &&
      approval !== 'approved'
    ) {
      throw new UnauthorizedException('Compte expert non validé');
    }
    const id = String(doc._id);
    const pair = this.authTokens.issuePair(id, role);
    return { success: true, accessToken: pair.accessToken, refreshToken: pair.refreshToken };
  }

  @Post('analyze-cv')
  @UseInterceptors(FileInterceptor('cv'))
  async analyzeCV(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new HttpException('Aucun fichier fourni', HttpStatus.BAD_REQUEST);
    }
    try {
      return await this.cvAnalysisService.analyzeCV(file.buffer, file.mimetype);
    } catch (e) {
      if (e instanceof HttpException) {
        throw e;
      }
      this.logger.warn(`analyze-cv: ${e}`);
      throw new HttpException('Erreur analyse CV', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
