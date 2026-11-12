# Ventas por artículo

Estado al 12/11/2026.

## Contexto

Las 3041 ventas importadas de `Control Facturación.xlsm` solo tienen la cabecera del comprobante
(tipo, número, fecha, cliente e importes). No dicen qué artículos se vendieron, así que el dashboard
no podía responder qué artículos se venden más ni cuáles son estacionales.

También se evaluó importar el detalle histórico desde el sistema con el que se emiten las facturas,
pero se descartó: el negocio no tiene registro de los artículos vendidos. Por eso el detalle se carga
en esta plataforma de ahora en adelante, y el análisis por artículo empieza desde cero.

## Detalle de artículos al cargar una venta

### Base de datos

Migración `sql/ventas_v4_items.sql` (se corre una vez en Supabase > SQL Editor, después de
`ventas_v3_usd.sql`). Crea la tabla `ventas_items`:

| Columna | Descripción |
|---|---|
| `venta_id` | Venta a la que pertenece. Si se borra la venta, se borran sus renglones. |
| `articulo_id` | Artículo del catálogo. Opcional: vacío para renglones fuera del catálogo (servicios, mano de obra). Si se borra el artículo queda en `null` y el renglón se conserva. |
| `descripcion` | Copia de la descripción al momento de la venta. |
| `cantidad` | Mayor a 0. Admite hasta 3 decimales (metros de cable, por ejemplo). |
| `precio_unitario_ars` | Precio unitario **neto (sin IVA)** en pesos. |
| `alicuota_iva` | Alícuota del renglón (21, 10,5, 27 o 0). |
| `subtotal_ars` | `cantidad × precio_unitario_ars`, neto. |

Los importes de los renglones van siempre en positivo; el signo lo da el tipo de comprobante
(las notas de crédito restan), igual que en las ventas.

> Hasta correr la migración, la pantalla de Ventas no puede listar comprobantes (la consulta pide los
> renglones) y el dashboard muestra un aviso en la sección Artículos.

### Pantalla "Ventas" (`/admin/manageSales`)

- Sección **Detalle de artículos**, opcional:
  - Buscador por referencia o descripción (`GET /api/articulos/buscar?q=`). Al elegir un artículo se
    propone su precio neto en pesos: `precio_venta / (1 + iva/100)`, multiplicado por el dólar del
    comprobante si el artículo está en dólares. El precio se puede corregir.
  - **Renglón libre** para lo que no está en el catálogo.
- Con renglones, el neto es la suma de los subtotales y el IVA la suma de cada subtotal por su
  alícuota (el IVA total se puede seguir corrigiendo a mano). Sin renglones, se carga el neto como antes.
- En el listado, los comprobantes con detalle muestran la cantidad de renglones y se despliegan.

La API (`POST /api/ventas`) recalcula el neto a partir de los renglones. Si falla el guardado de los
renglones, borra la venta para no dejarla a medias.

### Dashboard (`/admin/salesDashboard`)

Sección **Artículos**, calculada solo sobre las ventas que tienen detalle (se informa qué porcentaje
de la facturación del período representan):

- Artículos más vendidos: facturación, % del total, unidades, cantidad de ventas y de clientes.
- Facturación por marca y por categoría.
- Artículos estacionales: mismo criterio que con clientes (3 meses seguidos con la mitad o más de las
  ventas). Necesita que el artículo se haya vendido en al menos 4 comprobantes de 2 años distintos,
  así que con detalle cargado solo desde ahora tarda más de un año en mostrar resultados.
