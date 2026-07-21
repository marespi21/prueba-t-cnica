import { Module } from '@nestjs/common';
import { RequestsController } from './requests.controller';
import { RequestsScheduler } from './requests.scheduler';
import { RequestsService } from './requests.service';

@Module({
  controllers: [RequestsController],
  providers: [RequestsService, RequestsScheduler],
})
export class RequestsModule {}
