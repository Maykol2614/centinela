from fastapi import APIRouter, Depends
from sqlalchemy import cast, Date, func
from sqlalchemy.orm import Session

from database import get_db
import models
import schemas

router = APIRouter(prefix="/estadisticas", tags=["estadisticas"])


@router.get("", response_model=schemas.EstadisticasOut)
def obtener_estadisticas(db: Session = Depends(get_db)):
    dia = cast(models.Lectura.creado_en, Date)

    # Promedio de humedad de suelo agrupado por día calendario.
    promedios_diarios = (
        db.query(
            dia.label("fecha"),
            func.avg(models.Lectura.humedad_suelo).label("humedad_prom"),
        )
        .group_by(dia)
        .all()
    )

    dia_mas_humedo = schemas.DiaExtremo()
    dia_mas_seco = schemas.DiaExtremo()

    # NOTA sobre la convención de "húmedo" vs "seco":
    # Igual que en el sketch de Arduino, un valor MÁS ALTO de humedad_suelo
    # se interpreta como suelo más húmedo, y un valor MÁS BAJO (por debajo
    # de UMBRAL_SECO) como suelo seco. Si tu sensor está cableado al revés,
    # solo invierte estas dos líneas (max <-> min).
    if promedios_diarios:
        mas_humedo = max(promedios_diarios, key=lambda r: r.humedad_prom)
        mas_seco = min(promedios_diarios, key=lambda r: r.humedad_prom)
        dia_mas_humedo = schemas.DiaExtremo(
            fecha=str(mas_humedo.fecha), valor=round(mas_humedo.humedad_prom, 1)
        )
        dia_mas_seco = schemas.DiaExtremo(
            fecha=str(mas_seco.fecha), valor=round(mas_seco.humedad_prom, 1)
        )

    promedio_humedad = db.query(func.avg(models.Lectura.humedad_suelo)).scalar()
    promedio_gas = db.query(func.avg(models.Lectura.nivel_gas)).scalar()
    total_alarmas = (
        db.query(models.Lectura).filter(models.Lectura.alarma_activa.is_(True)).count()
    )
    ultima = (
        db.query(models.Lectura).order_by(models.Lectura.creado_en.desc()).first()
    )

    return schemas.EstadisticasOut(
        dia_mas_humedo=dia_mas_humedo,
        dia_mas_seco=dia_mas_seco,
        promedio_humedad=round(promedio_humedad, 1) if promedio_humedad is not None else None,
        promedio_gas=round(promedio_gas, 1) if promedio_gas is not None else None,
        total_alarmas=total_alarmas,
        ultima_lectura=ultima,
    )
