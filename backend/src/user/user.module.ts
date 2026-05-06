import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User, UserSchema } from './schemas/user.schema';
import { ProjectModule } from '../project/project.module';
import { MailModule } from '../mail/mail.module';
import { MarketplaceModule } from '../marketplace/marketplace.module';
import { JwtTokensModule } from '../auth/jwt-tokens.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ProjectModule,
    MailModule,
    MarketplaceModule,
    JwtTokensModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [MongooseModule, UserService],
})
export class UserModule {}
