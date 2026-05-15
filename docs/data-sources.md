# Data Sources

## 1. ChileCompra — Datos Abiertos

**URL principal:** https://datos-abiertos.chilecompra.cl

**URL de descargas:** https://datos-abiertos.chilecompra.cl/descargas/procesos-ocds

**Descripción:** Portal de datos abiertos de ChileCompra con descargas masivas de órdenes de compra, licitaciones y otros procesos en formatos abiertos.

**Acceso:** Libre, sin autenticación.

**Prioridad:** Alta — fuente primaria de contrataciones públicas.

**Estado:** Documentada como fuente objetivo; sin descarga activa en este repositorio.

---

## 2. API Mercado Público

**URL oficial:** https://www.chilecompra.cl/api/

**Descripción:** Plataforma de licitaciones del Estado chileno. API para acceder a información de procesos de compras públicas.

**Acceso:** Requiere ticket de acceso (registro gratuito disponible).

**Prioridad:** Alta — fuente complementaria de licitaciones.

**Estado:** Sin acceso activo verificado — requiere registro manual antes de implementar.

---

## 3. bastianolea/corrupcion_chile

**URL GitHub:** https://github.com/bastianolea/corrupcion_chile

**Descripción:** Repositorio con casos reales de corrupción en Chile (1989-2025). Incluye datos de白衣 municipal, casos parlamentares, y casos de organismos públicos. CSV con 131 casos documentados.

**Acceso:** Público, sin restricciones.

**Prioridad:** Alta — útil para casos reales y como anchor narrativo en la demo.

**Estado:** Fuente referenciada, no descargada al repo. Disponible para uso en kickoff.

---

## Nota sobre datos

Estos archivos NO deben subirse al repositorio público:
- CSVs crudos de ChileCompra
- Dumps de la API Mercado Público
- Archivos .xlsx con datos originales
- Cualquier binario o dato que supere 1MB

La excepción son archivos pequeños de trazabilidad (ej: listas de columnas, diccionarios de datos).