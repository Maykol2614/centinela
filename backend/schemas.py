from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class LecturaCreate(BaseModel):
    humedad_suelo: int
    nivel_gas: int
    alarma_activa: bool = False


class LecturaOut(BaseModel):
    id: int
    humedad_suelo: int
    nivel_gas: int
    alarma_activa: bool
    creado_en: datetime

    class Config:
        from_attributes = True


class DiaExtremo(BaseModel):
    fecha: Optional[str] = None
    valor: Optional[float] = None


class EstadisticasOut(BaseModel):
    dia_mas_humedo: DiaExtremo
    dia_mas_seco: DiaExtremo
    promedio_humedad: Optional[float] = None
    promedio_gas: Optional[float] = None
    total_alarmas: int
    ultima_lectura: Optional[LecturaOut] = None
