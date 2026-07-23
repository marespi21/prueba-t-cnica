import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/** Arranque del servidor Nest. */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);   //se crea app, se definen las turas 

  // Permite llamadas desde el frontend Angular (:4200).
  app.enableCors({
    origin: 'http://localhost:4200',
  });

  // Valida DTOs en todas las rutas.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}

void bootstrap();

//Se crea un servidor para que comience el back en el puerto 3000
//cors es un puerto puede llamar a otro puerto
//pipes func q se eject en cada llamado 
