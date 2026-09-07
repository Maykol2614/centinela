from typing import List, Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/lecturas", tags=["lecturas"])


@router.post("", response_model=schemas.LecturaOut)
def crear_lectura(lectura: schemas.LecturaCreate, db: Session = Depends(get_db)):
    """El ESP32 llama a este endpoint cada vez que envía una lectura."""
    nueva = models.Lectura(**lectura.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva


@router.get("", response_model=List[schemas.LecturaOut])
def listar_lecturas(limit: int = 200, db: Session = Depends(get_db)):
    """Devuelve las últimas `limit` lecturas en orden cronológico (para graficar)."""
    filas = (
        db.query(models.Lectura)
        .order_by(models.Lectura.creado_en.desc())
        .limit(limit)
        .all()
    )
    return list(reversed(filas))


@router.get("/actual", response_model=Optional[schemas.LecturaOut])
def lectura_actual(db: Session = Depends(get_db)):
    """Última lectura recibida, para mostrar el estado en tiempo real."""
    return (
        db.query(models.Lectura)
        .order_by(models.Lectura.creado_en.desc())
        .first()
    )
