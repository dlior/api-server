import { appConfig } from '@app/config';
import { KafkaModule } from '@app/infra';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './controllers';
import { AppService } from './services';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [appConfig] }), KafkaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
