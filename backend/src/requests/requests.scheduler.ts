import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RequestsService } from './requests.service';

/** Vence solicitudes sin gestión cada minuto. */
@Injectable()
export class RequestsScheduler {
  private readonly logger = new Logger(RequestsScheduler.name);

  constructor(private readonly requestsService: RequestsService) {}

  @Cron(CronExpression.EVERY_MINUTE)
  expireOldRequests(): void {
    const expiredRequests = this.requestsService.markExpiredRequests();

    if (expiredRequests.length > 0) {
      this.logger.log(`Solicitudes vencidas automáticamente: ${expiredRequests.length}`);
    }
  }
}
