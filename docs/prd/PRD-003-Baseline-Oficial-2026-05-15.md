# FRACTURA — PRD-003 Baseline Oficial

**Fecha de consolidación:** 2026-05-15
**Autores:** Christopher Schiefelbein + Perplexity (ciclo de conversación 4-15 mayo 2026)
**Estado:** BASELINE OFICIAL — INTOCABLE salvo bloqueo técnico real documentado
**Precedencia:** Este documento manda sobre PRD-001, PRD-002 y cualquier doc anterior.
          Si hay conflicto, manda la capa más reciente verificada aquí.

---

## 1. Identidad del proyecto

**Nombre:** FRACTURA
**Descriptor:** Motor cívico de rastreo anticorrupción. Chile. Datos públicos. Sin filtro.
**Naturaleza:** Open source, datos reales, no mock data.
**Track:** hacklatam 2026 — Transparency & Corruption — nodo UDD Santiago
**Duración:** 72 horas desde kick-off 2026-05-15 18:00 Chile

---

## 2. Producto — decisiones cerradas, no reabrir

FRACTURA detecta, explica y hace navegables señales de alerta en compras públicas,
licitaciones, proveedores y casos reales. Compite por evidencia y trazabilidad,
NO por dashboard bonito.

**Criterio de salida mínima válida (inviolable):**
1. Al menos 1 alerta real o defendible
2. Organismo identificado
3. Empresa identificada
4. Monto
5. Fecha
6. Patrón activado y nombrado
7. Fuente trazable
8. URL pública funcionando
9. Repo open source público

---

## 3. Stack operativo final

| Capa | Tecnología | Nota |
|---|---|---|
| Backend | FastAPI 0.115.0 | fijo |
| Persistencia + OLAP | DuckDB 1.5.2 | confirmado E1+E2+E3 |
| Frontend | React 19 + Vite + TypeScript | fijo |
| Visualización relaciones | react-force-graph | fijo |
| Deploy frontend | Vercel | fijo |
| Deploy backend | Railway (Python any) | fijo |

**Nota sobre PostgreSQL + AGE:** Incluido en scope post-hackathon si se requiere traversal de grafo profundo a escala millones de relaciones. Descartado para MVP por deuda técnica innecesaria en ventana de 72h.

---

## 4. Fuentes de datos

1. **ChileCompra bulk** — órdenes de compra 2023-2024 + licitaciones 2023-2024 — 48 archivos ZIP — FUENTE PRIMARIA
2. **corrupcionchile** (bastianolea) — 131 casos — bootstrap + demo anchor
3. **OCDS samples + docs API** — estructura, naming, expansión post-hackathon
4. **API Mercado Público** — NO depender para MVP, ticket enviado 2026-05-14

---

## 5. Patrones de detección MVP

**Obligatorios para MVP:**
- P1: Proveedor único recurrente
- P2: Fraccionamiento de contratos
- P3: Mismo RUT en múltiples organismos (multi-org)

**Opcionales si alcanza el tiempo:**
- P4: Empresa sin historial ganando contratos relevantes
- P5: Licitación con un solo oferente
- P6: Empresa sancionada que sigue recibiendo

---

## 6. Identidad visual — cerrada

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
  --border-radius:  0px;      /* INVIOLABLE */
}
```

clip-path en bordes, scanlines leves, glitch controlado, módulos tipo expediente, CERO gradientes SaaS, CERO border-radius.

---

## 7. Arquitectura

```
ZIPs ChileCompra
       ↓
   DuckDB OLAP
   (Lee ZIP directo, sin descomprimir)
       ↓
FastAPI endpoints
GET /health | POST /seed | POST /seed/chilecompra | POST /detect/chilecompra
GET /alerts/chilecompra | GET /graph/chilecompra | GET /entity/{id}
       ↓
React 19 + Vite + TS Frontend
react-force-graph
```

---

## 8. Seguridad — reglas fijas

- Secrets solo en Railway Dashboard + `.env.local` nunca al repo
- CORS: lista cerrada de orígenes, NUNCA `allow_origins=["*"]` en producción
- Rate limiting: `slowapi` 60 req/min en endpoints públicos
- Solo GET desde frontend — cero POST/PUT desde UI
- `.gitignore` bloquea: `.env`, `*.db`, `data/raw/`, `*.parquet`, `*.csv`, `*.zip`
- `dangerouslySetInnerHTML` prohibido salvo contenido sanitizado
- Paginación keyset/cursor siempre — nunca offset en producción

---

## 9. Estado confirmado al cierre de E3

**E1 Backend MVP:** ✅ FastAPI + DuckDB + loader corrupcion_chile + 128 casos
**E2 Patrones MVP:** ✅ run_detection() — P2=5 fraccionamiento, P3=7 multi-org, P1=0 (WARN documented)
**E3 Frontend Shell:** ✅ React 19 + Vite + TS + react-force-graph + AlertTable + GlobeGraph
**E4 Deploy:** Pendiente — TEST_MODE_THRESHOLD → producción → Railway → Vercel

---

## 10. Orden de trabajo E4

```
1. TEST_MODE_THRESHOLD → valores producción (P1>5, P2>=3+10M, P3>=3 orgs)
2. Full load ChileCompra (limit=0)
3. Railway deploy backend
4. Vercel deploy frontend
5. CORS origen real (no localhost)
6. Smoke test final
```

---

## 11. Mandato para agentes

Los agentes ejecutan. NO redefinen producto. NO cambian stack.
NO inventan entidades. NO afirman que algo funciona sin test.

Cada fase termina con:
- archivos creados/modificados
- qué quedó funcionando
- qué no quedó funcionando
- siguiente paso concreto

**No abrir exploración nueva. El coding empezó. Ejecutar.**

---

*Generado: 2026-05-16 01:03 AM Chile*
*Ciclo: Perplexity Space HackLatama-FVCK + Christopher Schiefelbein*