from sqlalchemy import Column, Integer, Boolean, DateTime
from sqlalchemy.sql import func

from database import Base


class Lectura(Base):
    __tablename__ = "lecturas"

    id = Column(Integer, primary_key=True, index=True)
    humedad_suelo = Column(Integer, nullable=False)   # lectura cruda del sensor de suelo (0-1023)
    nivel_gas = Column(Integer, nullable=False)        # lectura cruda del MQ-2 (0-1023)
    alarma_activa = Column(Boolean, default=False, nullable=False)
    creado_en = Column(DateTime(timezone=True), server_default=func.now(), index=True)
