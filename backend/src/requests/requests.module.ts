import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsScheduler } from './requests.scheduler';
import { RequestsService } from './requests.service';

/** Feature de solicitudes: rutas, lógica y cron. */
@Module({
  controllers: [RequestsController],
  providers: [RequestsService, RequestsScheduler],
})
export class RequestsModule {}
