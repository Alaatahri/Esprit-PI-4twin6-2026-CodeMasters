import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { Facture, FactureSchema } from './devis/schemas/facture.schema';
import { FacturesService } from './factures/factures.service';
import { UserModule } from './user/user.module';
import { ProjectModule } from './project/project.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { SuiviProjectModule } from './suivi-project/suivi-project.module';
import { DevisModule } from './devis/devis.module';
import { MarketplaceModule } from './marketplace/marketplace.module';
import { MatchingModule } from './matching/matching.module';
import { SuiviModule } from './suivi/suivi.module';
import { AlertsModule } from './alerts/alerts.module';
import { MessagesModule } from './messages/messages.module';
import { ProposalsModule } from './proposals/proposals.module';
import { ContractsModule } from './contracts/contracts.module';
import { AuthModule } from './auth/auth.module';
import { JwtTokensModule } from './auth/jwt-tokens.module';
import { JwtUserInterceptor } from './auth/jwt-user.interceptor';

@Module({
  imports: [
    JwtTokensModule,
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/bmp-tn',
      {
        // MongoDB connection options
      },
    ),
    MongooseModule.forFeature([{ name: Facture.name, schema: FactureSchema }]),
    UserModule,
    ProjectModule,
    DashboardModule,
    SuiviProjectModule,
    SuiviModule,
    AlertsModule,
    DevisModule,
    MarketplaceModule,
    MatchingModule,
    MessagesModule,
    ProposalsModule,
    ContractsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    FacturesService,
    { provide: APP_INTERCEPTOR, useClass: JwtUserInterceptor },
  ],
})
export class AppModule {}
