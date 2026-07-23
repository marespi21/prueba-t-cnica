import { RequestStatus } from './request-status.enum';

/** Modelo interno de una solicitud (persistencia en memoria). */
export interface RequestEntity {
  id: string;
  title: string;
  description: string;
  type: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}
