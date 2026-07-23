/** Estados alineados con el API Nest. */
export type RequestStatus =
  | 'borrador'
  | 'enviada'
  | 'en_revision'
  | 'aprobada'
  | 'rechazada'
  | 'vencida';

/** Solicitud completa (respuesta del backend). */
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

/** Payload de create/update (sin id ni status). */
export interface RequestPayload {
  title: string;
  description: string;
  type: string;
  resourceId?: string;
  startDate?: string;
  endDate?: string;
}
