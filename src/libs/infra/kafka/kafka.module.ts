import { Module } from '@nestjs/common';

import { KafkaService } from './services';

@Module({
  providers: [KafkaService],
  exports: [KafkaService],
})
export class KafkaModule {}
