export type RequestStatus =
  | 'borrador'
  | 'enviada'
  | 'en_revision'
  | 'aprobada'
  | 'rechazada'
  | 'vencida';

export interface RequestItem {
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

export interface RequestPayload {
  title: string;
  description: string;
  type: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
}
