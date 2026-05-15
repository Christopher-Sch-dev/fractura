# FRACTURA

Motor cívico de rastreo anticorrupción. Chile. Datos públicos. Sin filtro.

---

## Qué es

FRACTURA es una herramienta de análisis de datos públicos chilenos para detectar patrones de corrupción en contrataciones públicas. Usa grafos de relaciones para conectar entidades (empresas, organismos, personas, contratos) y aplicar queries de detección de anomalías.

---

## Estado actual

**Pre-kickoff — base documental mínima.**

Esto significa:
- Estructura del repositorio creada
- Fuentes de datos documentadas
- Modelo de datos diseñado (KuzuDB)
- Stack técnico definido

**No significa:**
- No hay backend funcionando
- No hay frontend corriendo
- No hay datos cargados
- No hay demo en vivo

El código empieza cuando comience el kickoff.

---

## Fuentes de datos previstas

| Fuente | Tipo | Acceso |
|--------|------|--------|
| ChileCompra Datos Abiertos | Compras públicas, proveedores, contratos | Libre |
| corrupcion_chile (GitHub) | Casos reales documentados, casos 1989-2025 | Público |
| Mercado Público API | Licitaciones, adjudicaciones | Requiere ticket |

---

## Stack objetivo (post-kickoff)

| Capa | Tecnología |
|------|------------|
| Backend API | FastAPI |
| Base de datos | KuzuDB (grafo) |
| Frontend | React 19 + Vite |
| Visualización | react-force-graph |
| Datos | Fuentes públicas chilenas |

---

## Estructura del repositorio

```
fractura/
├── backend/      # FastAPI app (post-kickoff)
├── frontend/     # React 19 + Vite (post-kickoff)
├── docs/         # Documentación del proyecto
├── data/         # Datos públicos versionables
├── AGENT.md      # Instrucciones para agentes de código
├── .env.example  # Variables de entorno (plantilla pública)
├── .gitignore
├── LICENSE
└── README.md
```

---

## Regla importante

**Pre-kickoff = exploración terminada. Coding = kickoff.**

Este repo existe como base documental y estructural. No prometo funcionalidades que no están construidas. Cuando empiece el kickoff, se construye el producto real sobre esta base.

---

## Licencia

MIT License — ver `LICENSE`