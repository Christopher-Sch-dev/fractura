# FRACTURA — Agent Instructions

## Antes de tocar nada
1. Leer `README.md` completo.
2. Revisar el estado actual del repositorio.
3. No inventar estado de avance.

## Reglas fundamentales

### Estado del proyecto
- **Pre-kickoff**: Esta fase es documental y exploratoria. Coding empieza en kickoff.
- **Post-kickoff**: Se construye sobre esta base documental.
- No inventar features, endpoints, demos o funcionalidades que no existan.

### Stack decidido (no renegociable)
- **Backend**: FastAPI + KuzuDB
- **Frontend**: React 19 + Vite + react-force-graph
- **Datos**: Fuentes públicas chilenas (ChileCompra, corrupcion_chile)

### Prohibido en esta fase
- Neo4j (no usar — KuzuDB es el motor)
- MongoDB (no usar)
- Mock data para "demo en vivo"
- Subir secretos, API keys reales, .env al repo público
- Subir CSVs crudos o dumps binarios al repo público

### Antes de subir cualquier cosa
- Verificar que no haya secretos en los archivos a commitear
- Datos reales SOLO de fuentes públicas documentadas
- Si algo requiere acceso manual (API keys, credenciales), pedir confirmación antes de continuar

## Estructura del repo

```
fractura/
├── backend/        # FastAPI app (post-kickoff)
├── frontend/       # React 19 + Vite (post-kickoff)
├── docs/           # Documentación
├── data/           # Datos públicos versionables (no binarios pesados)
├── AGENT.md        # Este archivo
├── README.md       # Contexto del proyecto
└── .env.example    # Variables de entorno (plantilla pública)
```

## Commits atómicos

- Cada commit resuelve UNA cosa
- Separar siempre: confirmado / pendiente / no verificado
- Si una tarea depende de resultado anterior, esperar antes de continuar

## Datos reales — fuentes trazadas

| Fuente | Ubicación | Acceso |
|--------|-----------|--------|
| ChileCompra Datos Abiertos | https://datos-abiertos.chilecompra.cl | Libre |
| corrupcion_chile | https://github.com/bastianolea/corrupcion_chile | Público |
| Mercado Público API | https://www.chilecompra.cl/api/ | Requiere ticket |

## Contacto con el usuario

Si algo requiere acceso manual, datos que no puedes verificar, o decisiones que no están en el prompt, **pregunta antes de continuar**.