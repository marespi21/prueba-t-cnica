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


//prov utilidades o serv q van a estar dispo
// def de las rutas

// boilerplate: muchas cosas que hacer o cambiar en todos archivos  para una sola cosa 
