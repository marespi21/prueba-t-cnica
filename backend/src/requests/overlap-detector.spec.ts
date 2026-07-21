import { findResourceOverlaps } from './overlap-detector';

describe('findResourceOverlaps', () => {
  it('devuelve conflictos solo para el mismo recurso', () => {
    const conflicts = findResourceOverlaps([
      {
        id: 'REQ-1',
        resourceId: 'vehiculo-1',
        startDate: '2026-07-22T08:00:00.000Z',
        endDate: '2026-07-22T10:00:00.000Z',
      },
      {
        id: 'REQ-2',
        resourceId: 'vehiculo-1',
        startDate: '2026-07-22T09:00:00.000Z',
        endDate: '2026-07-22T11:00:00.000Z',
      },
      {
        id: 'REQ-3',
        resourceId: 'vehiculo-2',
        startDate: '2026-07-22T09:00:00.000Z',
        endDate: '2026-07-22T11:00:00.000Z',
      },
    ]);

    expect(conflicts).toEqual([
      {
        resourceId: 'vehiculo-1',
        firstRequestId: 'REQ-1',
        secondRequestId: 'REQ-2',
        overlapStart: '2026-07-22T09:00:00.000Z',
        overlapEnd: '2026-07-22T10:00:00.000Z',
      },
    ]);
  });
});
