import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RequestItem, RequestPayload, RequestStatus } from './request.model';
import { RequestsService } from './requests.service';

/** Pantalla principal: formulario, filtro y acciones de flujo. */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly requestsService = inject(RequestsService);

  readonly statuses: Array<{ label: string; value: RequestStatus | '' }> = [
    { label: 'Todos', value: '' },
    { label: 'Borrador', value: 'borrador' },
    { label: 'Enviada', value: 'enviada' },
    { label: 'En revisión', value: 'en_revision' },
    { label: 'Aprobada', value: 'aprobada' },
    { label: 'Rechazada', value: 'rechazada' },
    { label: 'Vencida', value: 'vencida' },
  ];

  readonly requests = this.requestsService.requests;
  readonly loading = this.requestsService.loading;
  readonly error = this.requestsService.error;

  editingId: string | null = null;
  successMessage = '';

  readonly filterForm = this.formBuilder.nonNullable.group({
    status: ['' as RequestStatus | ''],
  });

  readonly requestForm = this.formBuilder.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(80)]],
    description: ['', [Validators.required, Validators.maxLength(500)]],
    type: ['transporte', [Validators.required]],
    resourceId: [''],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit(): void {
    this.requestsService.loadRequests();

    this.filterForm.controls.status.valueChanges.subscribe((status) => {
      this.requestsService.loadRequests(status);
    });
  }

  get formTitle(): string {
    return this.editingId ? 'Editar solicitud' : 'Nueva solicitud';
  }

  submitForm(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    const payload = this.toPayload();

    if (this.editingId) {
      this.requestsService.updateRequest(this.editingId, payload).subscribe({
        next: () => {
          this.successMessage = 'Solicitud actualizada.';
          this.resetForm();
        },
      });
      return;
    }

    this.requestsService.createRequest(payload).subscribe({
      next: () => {
        this.successMessage = 'Solicitud creada como borrador.';
        this.resetForm();
      },
    });
  }

  startEdit(request: RequestItem): void {
    if (this.isFinalStatus(request.status)) {
      this.successMessage = 'No se puede editar una solicitud en estado final.';
      return;
    }

    this.editingId = request.id;
    this.requestForm.setValue({
      title: request.title,
      description: request.description,
      type: request.type,
      resourceId: request.resourceId ?? '',
      startDate: this.toLocalInput(request.startDate),
      endDate: this.toLocalInput(request.endDate),
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  advance(request: RequestItem): void {
    const nextStatus = this.nextStatusFor(request.status);
    if (!nextStatus) {
      return;
    }

    this.requestsService.changeStatus(request.id, nextStatus).subscribe({
      next: () => {
        this.successMessage = `Solicitud ${request.id} actualizada.`;
      },
    });
  }

  approve(request: RequestItem): void {
    this.requestsService.changeStatus(request.id, 'aprobada').subscribe({
      next: () => {
        this.successMessage = `Solicitud ${request.id} aprobada.`;
      },
    });
  }

  reject(request: RequestItem): void {
    this.requestsService.changeStatus(request.id, 'rechazada').subscribe({
      next: () => {
        this.successMessage = `Solicitud ${request.id} rechazada.`;
      },
    });
  }

  /** Siguiente paso del botón Avanzar (UX; Nest valida la regla real). */
  nextStatusFor(status: RequestStatus): RequestStatus | null {
    const nextByStatus: Partial<Record<RequestStatus, RequestStatus>> = {
      borrador: 'enviada',
      enviada: 'en_revision',
    };

    return nextByStatus[status] ?? null;
  }

  isFinalStatus(status: RequestStatus): boolean {
    return status === 'aprobada' || status === 'rechazada' || status === 'vencida';
  }

  private resetForm(): void {
    this.editingId = null;
    this.requestForm.reset({
      title: '',
      description: '',
      type: 'transporte',
      resourceId: '',
      startDate: '',
      endDate: '',
    });
  }

  private toPayload(): RequestPayload {
    const rawValue = this.requestForm.getRawValue();

    return {
      title: rawValue.title,
      description: rawValue.description,
      type: rawValue.type,
      ...(rawValue.resourceId ? { resourceId: rawValue.resourceId } : {}),
      ...(rawValue.startDate ? { startDate: new Date(rawValue.startDate).toISOString() } : {}),
      ...(rawValue.endDate ? { endDate: new Date(rawValue.endDate).toISOString() } : {}),
    };
  }

  /** ISO del API → formato datetime-local del input. */
  private toLocalInput(value?: string): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    const pad = (n: number) => String(n).padStart(2, '0');

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
