# Data Sources

## 1. ChileCompra — Datos Abiertos

**URL principal:** https://www.chilecompra.cl/

**URL de descargas:** https://www.chilecompra.cl/opensource/

**Descripción:** Portal de compras públicas de Chile. Ofrece datasets con información de proveedores, contrataciones, licitaciones y adjudicaciones.

**Acceso:** Libre, sin autenticación. Descarga directa de archivos CSV.

**Prioridad:** Alta — es la fuente primaria de datos de contrataciones públicas.

**Estado:** Sin descarga activa — se documenta como fuente objetivo.

---

## 2. API Mercado Público

**URL oficial:** https://www.mercadopublico.cl/

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