# FRACTURA — PRD-003 Baseline Oficial
**Fecha de consolidación:** 2026-05-15
**Autores:** Christopher Schiefelbein + ciclo de sesión Perplexity/OpenCode
**Estado:** BASELINE OFICIAL — INTOCABLE salvo bloqueo técnico real documentado
**Precedencia:** Este documento manda sobre PRD-001, PRD-002 y cualquier doc anterior.

---

## 1. Identidad del proyecto

**Nombre:** FRACTURA
**Descriptor:** Motor cívico de rastreo anticorrupción. Chile. Datos públicos. Sin filtro.
**Naturaleza:** Open source, datos reales, no mock data.
**Track:** hacklatam 2026 — Transparency & Corruption — nodo UDD Santiago
**Duración:** 72 horas desde kick-off 2026-05-15 18:00 Chile

---

## 2. Producto — decisiones cerradas

FRACTURA detecta, explica y hace navegables señales de alerta en compras públicas,
licitaciones, proveedores y casos reales. Compite por evidencia y trazabilidad,
NO por dashboard bonito.

**Criterio de salida mínima válida (inviolable):**
1. Al menos 1 alerta real o defendible ✅ (12 alertas reales en slice 2023-01)
2. Organismo identificado ✅
3. Empresa identificada ✅
4. Monto ✅
5. Fecha ✅
6. Patrón activado y nombrado ✅ (fraccionamiento, multi-org, recurrente)
7. Fuente trazable ✅ (chilecompra_oc_2023-01)
8. URL pública funcionando ⚠️ (E4 deploy pendiente)
9. Repo open source público ⚠️ (pendiente)

---

## 3. Stack confirmado (sesión 2026-05-16)

| Capa | Tecnología | Estado |
|---|---|---|
| Backend | FastAPI 0.115.0 | ✅ Funcional |
| Persistencia | DuckDB 1.5.2 | ✅ Migrado (desde KuzuDB) |
| OLAP/ingesta | DuckDB 1.5.2 | ✅ Loader working |
| Frontend | React 19 + Vite + TypeScript | ✅ Build limpio |
| Visualización | react-force-graph-2d | ✅ Integrado |
| Deploy frontend | Vercel | ⚠️ E4 |
| Deploy backend | Railway | ⚠️ E4 |

**Nota migración:** KuzuDB → DuckDB por bloqueo técnico real (lock files Windows, API inconsistente). PRD-003 §3 autoriza explícitamente.

---

## 4. Fuentes de datos confirmadas

1. **ChileCompra bulk** — órdenes de compra 2023-2024 + licitaciones 2023-2024
   — 48 archivos ZIP en `fractura-local-data/raw/chilecompra/`
   — FUENTE PRIMARIA ✅ Loader funcionando (500 rows test OK)

2. **corrupcion_chile** (bastianolea) — 131 casos, 25 columnas
   — Solo en KuzuDB legacy (tabla `caso`). NO cargada en DuckDB actual.
   — ⚠️ Gap: demo anchor Virginia Reginato no disponible en UI actual

3. **OCDS samples + docs API** — estructura, naming, expansión post-hackathon
4. **API Mercado Público** — ticket enviado, no dependiente para MVP

---

## 5. Patrones de detección MVP — implementados ✅

**Obligatorios para MVP:**
- ✅ P1: Proveedor único recurrente ( umbral test: >2 org=1 | prod: >5 )
- ✅ P2: Fraccionamiento de contratos ( test: >=2+500k | prod: >=3+10M )
- ✅ P3: Mismo RUT en múltiples organismos ( test: >=3 | prod: >=3 )

**Resultados test con 500 contratos:**
- P1: 0 alertas ⚠️ [WARN] — umbral necesita full load
- P2: 5 alertas ✅
- P3: 7 alertas ✅
- Total: 12 alertas reales

---

## 6. Identidad visual — tokens verificados

```css
:root {
  --color-bg:       #0c0b09;
  --color-text:     #f0f0e8;
  --color-primary:  #00e5ff;
  --color-alert:    #ff1a1a;
  --color-accent:   #e87c0a;
  --color-critical: #39ff14;
  --font-display:   'Bebas Neue';
  --font-heading:   'Space Grotesk';
  --font-mono:      'JetBrains Mono';
  --border-radius:  0px; /* INVIOLABLE */
}
```

Lenguaje visual: clip-path en bordes, scanlines, glitch, módulos tipo expediente.
CERO gradientes SaaS. CERO border-radius.

---

## 7. Arquitectura actual

```
ZIPs ChileCompra
       ↓
   DuckDB OLAP (DuckDB 1.5.2)
   (Lee ZIP directo, QUALIFY ROW_NUMBER)
       ↓
   DuckDB (OLTP + FK constraints)
   Schema: organismo, empresa, contrato, alerta
       ↓
FastAPI endpoints:
GET  /health
GET  /alerts/chilecompra
POST /seed/chilecompra
POST /detect/chilecompra
GET  /entity/{id}
GET  /graph/chilecompra
```

---

## 8. Seguridad — reglas aplicadas ✅

- ✅ CORS: orígenes explícitos + max_age=600 + métodos mínimos
- ✅ VITE_API_URL es la única variable env en frontend
- ✅ No dangerouslySetInnerHTML ni .innerHTML en src/
- ✅ border-radius: 0 en tokens.css + global.css
- ✅ .gitignore bloquea .env, *.db, data/raw/
- ⚠️ Rate limiting: lentoapi no instalado aún (E4)

---

## 9. Estado al cierre E3

**✅ Implementado:**
- Backend FastAPI + DuckDB funcionando en http://127.0.0.1:8000
- 12 alertas reales (P2=5 fraccionamiento, P3=7 multi-org)
- GET /alerts/chilecompra → JSON con fuente trazable
- GET /graph/chilecompra → nodos + links reales
- Frontend shell React 19 + Vite + TS → http://localhost:5173
- AlertTable muestra 12 alertas reales ✅
- GlobeGraph renderiza relaciones ✅
- Design system tokens aplicados ✅
- Security checklist Passed ✅

**⚠️ Gaps conocidos:**
- corrupcion_chile / caso table NO cargada en DuckDB (tabla solo existe en KuzuDB legacy)
- Virginia Reginato demo anchor no disponible en UI actual
- TEST_MODE_THRESHOLD = 5000 aún en código (cambia en E4)
- Rate limiting no instalado
- Deploy no realizado

---

## 10. Orden E4 confirmado

```
1. TEST_MODE_THRESHOLD → prod (P1>5, P2>=3+10M, P3>=3)
2. Railway deploy backend
3. Vercel deploy frontend
4. CORS origen real (no localhost)
5. Optional: corrupcion_chile → DuckDB para Virginia Reginato
```

---

*Generado: 2026-05-16 01:XX AM Chile*
*Ciclo: sesión de desarrollo E1+E2+E3*