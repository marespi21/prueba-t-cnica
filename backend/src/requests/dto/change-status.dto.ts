import { IsEnum } from 'class-validator';
import { RequestStatus } from '../request-status.enum';

export class ChangeStatusDto {
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}
