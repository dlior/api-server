import { KafkaService } from '@app/infra';
import { Controller, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EachMessagePayload } from 'kafkajs';

import { AppService } from '../services';

@Controller()
export class AppController implements OnModuleInit {
  private readonly logger = new Logger(AppController.name);

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService,
    private readonly kafkaService: KafkaService,
  ) {}

  async onModuleInit() {
    this.kafkaService.consumer.connect();
    this.kafkaService.consumer.subscribe({
      topic: this.configService.getOrThrow<string>('kafka.topic'),
      fromBeginning: true,
    });
    await this.kafkaService.consumer.run({
      autoCommit: false,
      eachMessage: this.processMessage.bind(this),
    });
  }

  async processMessage(payload: EachMessagePayload): Promise<void> {
    try {
      const {
        topic,
        partition,
        message: { offset, key, value },
      } = payload;
      this.logger.log('Processing message', { topic, partition, offset, key, value: JSON.parse(value!.toString()) });
    } catch (error) {
      this.logger.error('Error processing message', { error });
      throw error;
    } finally {
      const {
        message: { offset },
        partition,
        topic,
      } = payload;
      await this.kafkaService.consumer.commitOffsets([{ topic, partition, offset: `${+offset + 1}` }]);
      this.logger.log(`Committed offset: ${+offset + 1}`);
    }
  }
}
