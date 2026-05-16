from pydantic import BaseModel
from typing import Optional

class SeedResponse(BaseModel):
    organismos: int = 0
    empresas: int = 0
    entidades: int = 0
    contratos: int = 0
    casos: int = 0
    alertas: int = 0
    filas_procesadas: int = 0
    fuente: Optional[str] = None

class HealthResponse(BaseModel):
    status: str
    db: str

class AlertaResponse(BaseModel):
    alertas: list[dict]

class EntityResponse(BaseModel):
    id: str
    nombre: str
    tipo: str
    source: Optional[str] = None
    neighbors: list[dict]

class AlertaItem(BaseModel):
    id: Optional[str] = None
    tipo: str
    mensaje: str
    monto: Optional[int] = None
    fecha_deteccion: Optional[str] = None
    organismo_id: Optional[str] = None
    proveedor_id: Optional[str] = None
    empresa_rut: Optional[str] = None
    descripcion: Optional[str] = None
    severidad: Optional[str] = None
    patron: Optional[str] = None
    fuente: Optional[str] = None
    created_at: Optional[str] = None

class DetectionResponse(BaseModel):
    fuentes: dict