import { RequestStatus } from './request-status.enum';

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
