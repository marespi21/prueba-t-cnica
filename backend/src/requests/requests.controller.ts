import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ChangeStatusDto } from './dto/change-status.dto';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { BookingConflict } from './overlap-detector';
import { RequestEntity } from './request.entity';
import { RequestStatus } from './request-status.enum';
import { RequestsService } from './requests.service';

/** Endpoints REST de /requests. Delega la lógica al service. */
@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Get() // /requests/?status=open
  findAll(@Query('status') status?: RequestStatus): RequestEntity[] {
    return this.requestsService.findAll(status);
  }

  /** Debe ir antes de :id para no confundir "conflicts" con un id. */
  @Get('conflicts') // /requests/conflicts
  findConflicts(): BookingConflict[] {
    return this.requestsService.findResourceConflicts();
  }

  @Get(':id') // /requests/123
  findOne(@Param('id') id: string): RequestEntity {
    return this.requestsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateRequestDto): RequestEntity {
    return this.requestsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateRequestDto): RequestEntity {
    return this.requestsService.update(id, dto);
  }

  @Patch(':id/status')
  changeStatus(@Param('id') id: string, @Body() dto: ChangeStatusDto): RequestEntity {
    return this.requestsService.changeStatus(id, dto.status);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): void {
    this.requestsService.remove(id);
  }
}

//controlador es el que atienede a las solicitudes a cada request o petic 
// constructor, es como algo va a inicializarse 
//define rutas x medio de pet
