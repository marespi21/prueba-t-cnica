export interface ResourceBooking {
  id: string;
  resourceId: string;
  startDate: string;
  endDate: string;
}

export interface BookingConflict {
  resourceId: string;
  firstRequestId: string;
  secondRequestId: string;
  overlapStart: string;
  overlapEnd: string;
}

/**
 * Detecta solapamientos del mismo recurso.
 * Ordena por recurso + inicio y compara con reservas aún activas.
 */
export function findResourceOverlaps(bookings: ResourceBooking[]): BookingConflict[] {
  const sortedBookings = [...bookings].sort((first, second) => {
    if (first.resourceId !== second.resourceId) {
      return first.resourceId.localeCompare(second.resourceId);
    }

    return new Date(first.startDate).getTime() - new Date(second.startDate).getTime();
  });

  const conflicts: BookingConflict[] = [];
  const activeBookingsByResource = new Map<string, ResourceBooking[]>();

  for (const current of sortedBookings) {
    const activeBookings = activeBookingsByResource.get(current.resourceId) ?? [];
    const currentStart = new Date(current.startDate);
    const stillActiveBookings = activeBookings.filter(
      (booking) => new Date(booking.endDate) > currentStart,
    );

    for (const activeBooking of stillActiveBookings) {
      conflicts.push({
        resourceId: current.resourceId,
        firstRequestId: activeBooking.id,
        secondRequestId: current.id,
        overlapStart: maxIsoDate(activeBooking.startDate, current.startDate),
        overlapEnd: minIsoDate(activeBooking.endDate, current.endDate),
      });
    }

    activeBookingsByResource.set(current.resourceId, [...stillActiveBookings, current]);
  }

  return conflicts;
}

function maxIsoDate(first: string, second: string): string {
  return new Date(first) > new Date(second) ? first : second;
}

function minIsoDate(first: string, second: string): string {
  return new Date(first) < new Date(second) ? first : second;
}
