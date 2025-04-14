import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './db/database.module';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
