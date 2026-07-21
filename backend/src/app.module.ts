import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RequestsModule } from './requests/requests.module';

@Module({
  imports: [ScheduleModule.forRoot(), RequestsModule],
})
export class AppModule {}
