import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, catchError, finalize, tap, throwError } from 'rxjs';
import { RequestItem, RequestPayload, RequestStatus } from './request.model';

@Injectable({ providedIn: 'root' })
export class RequestsService {
  private readonly apiUrl = 'http://localhost:3000/requests';

  readonly requests = signal<RequestItem[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  constructor(private readonly http: HttpClient) {}

  loadRequests(status?: RequestStatus | ''): void {
    this.loading.set(true);
    this.error.set(null);

    const params = status ? new HttpParams().set('status', status) : undefined;

    this.http
      .get<RequestItem[]>(this.apiUrl, { params })
      .pipe(
        tap((requests) => this.requests.set(requests)),
        catchError((error: unknown) => this.handleError(error)),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
  }

  createRequest(payload: RequestPayload): Observable<RequestItem> {
    return this.http.post<RequestItem>(this.apiUrl, payload).pipe(
      tap(() => this.loadRequests()),
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  updateRequest(id: string, payload: RequestPayload): Observable<RequestItem> {
    return this.http.patch<RequestItem>(`${this.apiUrl}/${id}`, payload).pipe(
      tap(() => this.loadRequests()),
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  changeStatus(id: string, status: RequestStatus): Observable<RequestItem> {
    return this.http.patch<RequestItem>(`${this.apiUrl}/${id}/status`, { status }).pipe(
      tap(() => this.loadRequests()),
      catchError((error: unknown) => this.handleError(error)),
    );
  }

  private handleError(error: unknown): Observable<never> {
    console.error(error);
    this.error.set('Ocurrió un error al comunicarse con el backend.');
    return throwError(() => error);
  }
}
