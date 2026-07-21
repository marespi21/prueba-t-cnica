# Gestión de Solicitudes

Prueba técnica Fullstack con **Angular 22**, **NestJS 11** y **TypeScript 6**.

La app permite crear y editar solicitudes, filtrarlas por estado y avanzar su flujo de aprobación con una máquina de estados controlada en el backend.

## Versiones usadas

| Tecnología | Versión | Nota |
| --- | --- | --- |
| Angular | `22.0.7` | Última estable al momento de la entrega |
| NestJS | `11.1.28` | Última estable al momento de la entrega |
| TypeScript | `6.0.3` | Última compatible con Angular 22 |

> Angular 22 exige TypeScript `>=6.0.0 <6.1.0`. Por eso no usé TypeScript 7: rompería el build del frontend. Esta decisión queda documentada a propósito.

## Cómo levantarlo

Requisitos: Node.js y npm.

```bash
npm install
npm run start:backend
npm run start:frontend
```

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:4200`

Otros comandos:

```bash
npm test
npm run build
```

## Funcionalidad

### Backend

Endpoints:

```text
GET    /requests
GET    /requests?status=borrador
GET    /requests/:id
POST   /requests
PATCH  /requests/:id
PATCH  /requests/:id/status
DELETE /requests/:id
GET    /requests/conflicts
```

Flujo de estados:

```text
borrador → enviada → en_revision → aprobada
                                 → rechazada
```

Además, `enviada` y `en_revision` pueden pasar a `vencida` automáticamente.

### Frontend

- Formulario de creación y edición con validaciones.
- Listado con filtro reactivo por estado.
- Feedback de carga, errores y mensajes de éxito.
- Botones para avanzar, aprobar o rechazar según el estado.

## Automatización

Usé `@nestjs/schedule`.

Cada minuto el backend revisa solicitudes en `enviada` o `en_revision`. Si llevan más de 60 minutos sin actualizarse, se marcan como `vencida`.

Elegí esta automatización porque:
1. Es simple de demostrar.
2. Tiene sentido de negocio.
3. No depende de herramientas externas para una prueba corta.

Con más tiempo la movería a una cola o a un workflow en n8n.

## Decisiones técnicas

### Persistencia en memoria

Elegí memoria porque el foco de la prueba es arquitectura, validaciones, estados, frontend y automatización. Agregar base de datos aumentaría la configuración sin cambiar mucho la lógica evaluada.

Desventaja: los datos se pierden al reiniciar el backend. Queda documentado como supuesto.

### Autenticación

No implementé autenticación real. Asumí que cualquier usuario puede crear solicitudes y que los botones de aprobación representan la acción de un aprobador.

En producción agregaría JWT, roles y guards en NestJS.

### Manejo de estado en Angular

Usé **signals** dentro de un servicio.

Por qué:
- Angular 22 recomienda signals para estado local/simple.
- El servicio centraliza HTTP y el estado (`requests`, `loading`, `error`).
- El componente solo lee signals y llama métodos.
- No hace falta una librería de estado global para una sola pantalla.

### Máquina de estados

Las transiciones permitidas están en una tabla dentro del servicio. Así la regla es clara y fácil de explicar:

```text
rechazada → aprobada   ❌ no permitido
borrador → enviada     ✅ permitido
```

## Reto lógico: solapamientos

Archivo:

```text
backend/src/requests/overlap-detector.ts
```

Idea:

1. Ordenar por recurso y fecha de inicio.
2. Mantener reservas activas por recurso.
3. Si una nueva reserva empieza antes de que termine una activa del mismo recurso, hay conflicto.

Complejidad aproximada: `O(n log n + k)`.

También hay un test unitario de esta función.

## Supuestos

- Una solicitud nueva empieza en `borrador`.
- Estados finales: `aprobada`, `rechazada`, `vencida`.
- No se editan solicitudes en estado final.
- Persistencia en memoria es suficiente para la demo.
- Autenticación queda fuera del alcance y se documenta como mejora.
- El vencimiento automático usa 60 minutos sin gestión.

## Qué haría con más tiempo

- PostgreSQL con Prisma o TypeORM.
- JWT + roles (empleado / aprobador).
- Más tests unitarios y e2e.
- Docker Compose.
- CI con GitHub Actions.
- Vista de conflictos de recursos en el frontend.

## Cómo explicarlo en entrevista (versión corta)

Separé responsabilidades: el backend concentra reglas (DTOs, estados, errores y cron); el frontend se enfoca en UX (formulario, filtro, carga y mensajes). Preferí memoria para enfocarme en lo que pedía la prueba, y documenté cómo lo evolucionaría a producción.
