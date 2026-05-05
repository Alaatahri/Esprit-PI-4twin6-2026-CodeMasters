import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
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

function getMongoUri(): string {
  return process.env.MONGODB_URI?.trim() || 'mongodb://localhost:27017/bmp-tn';
}

@Module({
  imports: [
    MongooseModule.forRoot(getMongoUri(), {
      /**
       * Vercel/Serverless: si MONGODB_URI n’est pas défini, tenter localhost fera
       * échouer le boot (FUNCTION_INVOCATION_FAILED). On évite de bloquer le démarrage
       * et on laisse les routes qui n’utilisent pas Mongo répondre.
       *
       * Important: en production il faut fournir un MONGODB_URI public (Atlas, etc.).
       */
      lazyConnection: Boolean(process.env.VERCEL) && !process.env.MONGODB_URI,
      serverSelectionTimeoutMS: 8_000,
    }),
    UserModule,
    AuthModule,
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
  ],
  controllers: [AppController],
})
export class AppModule {}
