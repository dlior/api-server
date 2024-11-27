import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Consumer, Kafka, LogEntry, logLevel as LogLevel } from 'kafkajs';

@Injectable()
export class KafkaService {
  private readonly logger = new Logger(KafkaService.name);
  protected readonly kafka: Kafka;
  readonly consumer: Consumer;

  constructor(private readonly configService: ConfigService) {
    const { brokers, clientId, groupId } = this.configService.getOrThrow<{
      brokers: string[];
      clientId: string;
      groupId: string;
    }>('kafka');
    this.kafka = new Kafka({
      clientId,
      brokers,
      logCreator: this.logCreator.bind(this),
    });
    this.consumer = this.kafka.consumer({ groupId });
  }

  private logCreator() {
    return ({ log: { message, ...extra }, namespace, level }: LogEntry) => {
      switch (level) {
        case LogLevel.NOTHING:
        case LogLevel.ERROR:
          this.logger.error(message, JSON.stringify({ namespace, ...extra }));
          break;

        case LogLevel.WARN:
          this.logger.warn(message, JSON.stringify({ namespace, ...extra }));
          break;

        case LogLevel.DEBUG:
          this.logger.debug(message, JSON.stringify({ namespace, ...extra }));
          break;

        case LogLevel.INFO:
        default:
          this.logger.log(message);
      }
    };
  }
}
