import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { RequestsModule } from './requests/requests.module';

/** Módulo raíz: cron + feature de solicitudes. */
@Module({
  imports: [ScheduleModule.forRoot(), RequestsModule],
})
export class AppModule {}



// se def modulo de las rutas 
//inyect deped 
//rutas esten dispo en el main.ts