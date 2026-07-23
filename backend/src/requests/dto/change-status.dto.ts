import { IsEnum } from 'class-validator';
import { RequestStatus } from '../request-status.enum';

/** Body de cambio de estado. La transición la valida el service. */
export class ChangeStatusDto {
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}
