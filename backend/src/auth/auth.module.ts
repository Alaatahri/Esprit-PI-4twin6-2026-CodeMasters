import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CvAnalysisService } from './cv-analysis.service';
import { UserModule } from '../user/user.module';
import { JwtTokensModule } from './jwt-tokens.module';

@Module({
  imports: [UserModule, JwtTokensModule],
  controllers: [AuthController],
  providers: [CvAnalysisService],
})
export class AuthModule {}
