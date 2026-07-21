import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { BookingConflict, findResourceOverlaps, ResourceBooking } from './overlap-detector';
import { RequestEntity } from './request.entity';
import { RequestStatus } from './request-status.enum';

const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  [RequestStatus.Draft]: [RequestStatus.Submitted],
  [RequestStatus.Submitted]: [RequestStatus.InReview, RequestStatus.Expired],
  [RequestStatus.InReview]: [RequestStatus.Approved, RequestStatus.Rejected, RequestStatus.Expired],
  [RequestStatus.Approved]: [],
  [RequestStatus.Rejected]: [],
  [RequestStatus.Expired]: [],
};

@Injectable()
export class RequestsService {
  private readonly expirationMinutes = 60;

  private requests: RequestEntity[] = [
    {
      id: 'REQ-1',
      title: 'Transporte a planta norte',
      description: 'Necesito vehículo para visitar la planta norte.',
      type: 'transporte',
      resourceId: 'vehiculo-1',
      startDate: '2026-07-22T08:00:00.000Z',
      endDate: '2026-07-22T10:00:00.000Z',
      status: RequestStatus.Submitted,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  findAll(status?: RequestStatus): RequestEntity[] {
    if (!status) {
      return this.requests;
    }

    return this.requests.filter((request) => request.status === status);
  }

  findOne(id: string): RequestEntity {
    const request = this.requests.find((current) => current.id === id);

    if (!request) {
      throw new NotFoundException(`No existe la solicitud ${id}`);
    }

    return request;
  }

  create(dto: CreateRequestDto): RequestEntity {
    this.validateDateRange(dto.startDate, dto.endDate);

    const now = new Date().toISOString();
    const request: RequestEntity = {
      id: `REQ-${Date.now()}`,
      ...dto,
      status: RequestStatus.Draft,
      createdAt: now,
      updatedAt: now,
    };

    this.requests = [request, ...this.requests];
    return request;
  }

  update(id: string, dto: UpdateRequestDto): RequestEntity {
    const request = this.findOne(id);

    if (this.isFinalStatus(request.status)) {
      throw new BadRequestException('No se puede editar una solicitud en estado final');
    }

    const updatedRequest: RequestEntity = {
      ...request,
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    this.validateDateRange(updatedRequest.startDate, updatedRequest.endDate);
    this.requests = this.requests.map((current) => (current.id === id ? updatedRequest : current));

    return updatedRequest;
  }

  remove(id: string): void {
    this.findOne(id);
    this.requests = this.requests.filter((request) => request.id !== id);
  }

  changeStatus(id: string, nextStatus: RequestStatus): RequestEntity {
    const request = this.findOne(id);
    const allowedStatuses = ALLOWED_TRANSITIONS[request.status];

    if (!allowedStatuses.includes(nextStatus)) {
      throw new BadRequestException(
        `Transición inválida: ${request.status} no puede cambiar a ${nextStatus}`,
      );
    }

    const updatedRequest: RequestEntity = {
      ...request,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    };

    this.requests = this.requests.map((current) => (current.id === id ? updatedRequest : current));
    return updatedRequest;
  }

  markExpiredRequests(): RequestEntity[] {
    const now = new Date();
    const expiredRequests: RequestEntity[] = [];

    this.requests = this.requests.map((request) => {
      if (!this.canExpire(request, now)) {
        return request;
      }

      const expiredRequest: RequestEntity = {
        ...request,
        status: RequestStatus.Expired,
        updatedAt: now.toISOString(),
      };

      expiredRequests.push(expiredRequest);
      return expiredRequest;
    });

    return expiredRequests;
  }

  findResourceConflicts(): BookingConflict[] {
    const bookings: ResourceBooking[] = this.requests
      .filter((request) => request.resourceId && request.startDate && request.endDate)
      .map((request) => ({
        id: request.id,
        resourceId: request.resourceId as string,
        startDate: request.startDate as string,
        endDate: request.endDate as string,
      }));

    return findResourceOverlaps(bookings);
  }

  private canExpire(request: RequestEntity, now: Date): boolean {
    const expirableStatuses = [RequestStatus.Submitted, RequestStatus.InReview];
    const ageInMinutes = (now.getTime() - new Date(request.updatedAt).getTime()) / 60000;

    return expirableStatuses.includes(request.status) && ageInMinutes >= this.expirationMinutes;
  }

  private isFinalStatus(status: RequestStatus): boolean {
    return [RequestStatus.Approved, RequestStatus.Rejected, RequestStatus.Expired].includes(status);
  }

  private validateDateRange(startDate?: string, endDate?: string): void {
    if (!startDate || !endDate) {
      return;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      throw new BadRequestException('La fecha de inicio debe ser anterior a la fecha de fin');
    }
  }
}
