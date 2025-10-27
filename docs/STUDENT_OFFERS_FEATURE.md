# 📋 Funcionalidad: Visualización de Ofertas para Estudiantes

## 🎯 Descripción General

Esta funcionalidad permite a los estudiantes **explorar y visualizar ofertas de pasantías aprobadas** disponibles en la plataforma. Los estudiantes pueden buscar, filtrar y postularse a ofertas que coincidan con sus intereses y habilidades.

## 🔌 Endpoint Backend

### GET `/api/students/offers`

**Parámetros de Query:**

- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Cantidad de ofertas por página (default: 12, max: 50)
- `search` (opcional): Búsqueda por texto en título o descripción
- `technology_id` (opcional): Filtrar por tecnología específica
- `modality_id` (opcional): Filtrar por modalidad (presencial, remoto, híbrido)
- `location_id` (opcional): Filtrar por ubicación
- `position_id` (opcional): Filtrar por posición

**Respuesta del Backend:**

```json
{
  "data": {
    "offers": [
      {
        "id": 2,
        "organization_id": 1,
        "position_id": 1,
        "duration_id": 1,
        "location_id": 1,
        "modality_id": 1,
        "title": "desarrollador",
        "description": "desarrollador DESCRIPCION",
        "requirements": "desarrollador requisitos",
        "salary": 21,
        "quota": 3,
        "published_start_date": "2025-10-27",
        "application_deadline": "2025-11-07",
        "weekly_hours": 20,
        "shift": "morning",
        "status": "approved",
        "technologies": null,
        "created_at": "2025-10-26T21:15:27Z",
        "updated_at": "2025-10-26T21:16:09Z",
        "position_name": "Desarrollador1",
        "modality_name": "Presencial",
        "duration_name": "Anual",
        "location_name": "San Francisco",
        "organization_name": "TechSolutions S.A.",
        "has_applied": false
      }
    ],
    "page": 1,
    "limit": 12,
    "total_count": 1,
    "total_pages": 1
  },
  "message": "Ofertas aprobadas obtenidas exitosamente"
}
```

## 📁 Estructura de Archivos

### 1. **Tipos y Modelos** (`src/types/student-offers.ts`)

Define las interfaces TypeScript para las ofertas:

- `StudentOffer`: Oferta resumida con toda la información
- `StudentOfferDetail`: Detalles completos de una oferta (alias de StudentOffer)
- `StudentOffersResponse`: Respuesta del endpoint de listado
- `StudentOffersFilters`: Filtros disponibles para búsqueda
- `StudentOffersState`: Estado del hook de gestión

### 2. **Servicios** (`src/services/studentOfferService.ts`)

Maneja las llamadas HTTP al backend:

- `listOffers(filters)`: Obtiene el listado paginado de ofertas
- `getOfferDetail(id)`: Obtiene los detalles de una oferta específica
- `searchOffers(searchTerm)`: Busca ofertas por término

### 3. **Custom Hook** (`src/hooks/use-student-offers.ts`)

Hook React que gestiona todo el estado y lógica:

- Carga de ofertas con filtros
- Paginación
- Búsqueda y filtrado
- Selección de ofertas para ver detalles
- Manejo de errores y estados de carga

### 4. **Componentes de UI**

#### `OfferCard.tsx`

Tarjeta resumida de oferta que muestra:

- Título y organización
- Posición y ubicación
- Modalidad (presencial, remoto, híbrido)
- Horas semanales y turno
- Duración y salario
- Tecnologías requeridas
- Fecha límite de postulación
- Estado de postulación (si ya aplicó)

#### `OffersFilterPanel.tsx`

Panel de filtros que permite:

- Búsqueda por texto
- Filtro por tecnología
- Filtro por modalidad
- Filtro por ubicación
- Filtro por posición
- Limpiar todos los filtros
- Contador de filtros activos

#### `OfferDetailModal.tsx`

Modal con información completa:

- Todos los detalles de la oferta
- Descripción completa y requisitos
- Información de contacto y condiciones
- Botón para postularse
- Indicador si ya se postuló

#### `ApplyConfirmationModal.tsx`

Modal de confirmación para postularse:

- Confirmación de la acción
- Opción de agregar mensaje opcional
- Estado de carga durante postulación
- Mensajes de error si fallan

### 5. **Página Principal** (`src/pages/dashboard/StudentOffersPage.tsx`)

Componente principal que integra todo:

- Header con información contextual
- Panel de filtros
- Grid de ofertas (3 columnas en desktop)
- Paginación
- Estados de carga, error y sin resultados
- Integración con modales de detalle y postulación

## 🎨 Características Visuales

### Grid de Ofertas

- **Responsive**: 1 columna en móvil, 2 en tablet, 3 en desktop
- **Tarjetas elevadas**: Efectos de sombra y hover
- **Información compacta**: Datos más importantes visibles
- **Badges**: Indicadores visuales de estado y modalidad
- **Iconos**: Lucide Icons para mejorar la experiencia visual

### Sistema de Filtros

- **Panel colapsable**: Filtros agrupados en card
- **Selects personalizados**: shadcn/ui components
- **Búsqueda en tiempo real**: Input con debounce
- **Contador de filtros**: Badge mostrando filtros activos
- **Botones de acción**: Limpiar y actualizar

### Paginación

- **Navegación numérica**: Hasta 5 páginas visibles
- **Botones anterior/siguiente**: Navegación rápida
- **Información contextual**: "Página X de Y", "Z ofertas"
- **Estados disabled**: Cuando no hay más páginas

### Estados de UI

- **Loading**: Skeleton loaders mientras carga
- **Empty State**: Mensaje cuando no hay ofertas
- **Error State**: Alert con mensaje de error
- **Success State**: Grid de ofertas con datos

## 🔄 Flujo de Usuario

1. **Acceso**: Usuario hace clic en "Ver ofertas" desde el dashboard
2. **Carga inicial**: Se muestran las primeras 12 ofertas aprobadas
3. **Exploración**: Usuario puede:
   - Aplicar filtros por tecnología, modalidad, ubicación, posición
   - Buscar por texto en título o descripción
   - Navegar entre páginas
   - Ver el total de ofertas disponibles
4. **Ver detalles**: Click en "Ver Detalles" abre modal con información completa
5. **Postularse**: Click en "Postularme" abre modal de confirmación
6. **Confirmación**: Usuario puede agregar mensaje opcional y confirmar
7. **Feedback**: Toast notification confirma la postulación exitosa
8. **Actualización**: La oferta se marca como "Ya postulado"

## 🔐 Seguridad y Validaciones

- ✅ Ruta protegida con `AuthGuard` (solo estudiantes)
- ✅ Solo se muestran ofertas con estado "approved"
- ✅ Validación de campos en formulario de postulación
- ✅ Manejo de errores HTTP con mensajes claros
- ✅ Prevención de postulaciones duplicadas

## 🛠️ Tecnologías Utilizadas

- **React 18** con TypeScript
- **React Router 6** para navegación
- **shadcn/ui** para componentes
- **Tailwind CSS** para estilos
- **Lucide React** para iconos
- **Zustand** para estado global de catálogos
- **Custom hooks** para lógica reutilizable

## 📊 Datos de Catálogos

La funcionalidad utiliza los siguientes catálogos:

### Tecnologías (`/api/catalog/technologies`)

- Lista de tecnologías disponibles
- Filtrado por `is_active`

### Posiciones (`/api/catalog/positions`)

- Roles/posiciones de pasantías
- Ejemplos: Desarrollador, Diseñador, QA, etc.

### Duraciones (`/api/catalog/durations`)

- Períodos de las pasantías
- Ejemplos: Trimestral, Semestral, Anual

### Ubicaciones (`/api/catalog/locations`)

- Ciudades/provincias disponibles
- Incluye país, provincia y ciudad

### Modalidades (`/api/catalog/modalities`)

- Tipos de trabajo: Presencial, Remoto, Híbrido
- Descripción de cada modalidad

## 🐛 Manejo de Casos Especiales

### Technologies = null

El campo `technologies` puede venir como `null` del backend. El frontend lo maneja con:

```typescript
technologies: number[] | null;

// En los componentes
if (!offer.technologies || offer.technologies.length === 0) return [];
```

### Sin ofertas disponibles

Se muestra un estado vacío amigable con:

- Icono ilustrativo
- Mensaje contextual
- Botón para limpiar filtros (si hay filtros aplicados)

### Ofertas por vencer

Se destacan visualmente las ofertas que cierran en menos de 7 días:

- Badge rojo "Cierra pronto"
- Fecha en color destructive

### Ya postulado

Las ofertas donde el estudiante ya se postuló muestran:

- Badge verde "Ya postulado"
- Botón deshabilitado
- Mensaje informativo

## 📱 Responsive Design

- **Mobile (< 768px)**: 1 columna, filtros colapsables
- **Tablet (768px - 1024px)**: 2 columnas
- **Desktop (> 1024px)**: 3 columnas, todos los filtros visibles

## ⚡ Performance

- **Lazy loading**: Solo carga 12 ofertas por página
- **Catálogos cacheados**: Zustand store previene múltiples llamadas
- **useMemo**: Optimización de cálculos en componentes
- **useCallback**: Prevención de re-renders innecesarios

## 🧪 Testing

Áreas clave para testing:

- [ ] Carga inicial de ofertas
- [ ] Aplicación de filtros
- [ ] Búsqueda por texto
- [ ] Paginación
- [ ] Apertura de modal de detalles
- [ ] Proceso de postulación
- [ ] Manejo de errores
- [ ] Estados de carga

## 🔮 Mejoras Futuras

1. **Guardado de ofertas favoritas**
2. **Recomendaciones personalizadas**
3. **Notificaciones de nuevas ofertas**
4. **Filtros avanzados** (rango de salario, fecha de publicación)
5. **Vista de lista vs grid**
6. **Exportar ofertas a PDF**
7. **Compartir ofertas por link**

---

**Última actualización**: Octubre 26, 2025
**Versión**: 1.0.0
**Autor**: Equipo de Desarrollo Uni Internship Hub
