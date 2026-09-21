from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 (necesario para que create_all vea el modelo)
from routers import lecturas, estadisticas

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Centinela API",
    description="API del sistema de alerta temprana de incendios subterráneos",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # en producción, restringe esto al dominio de tu frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lecturas.router)
app.include_router(estadisticas.router)


@app.get("/")
def root():
    return {"status": "ok", "servicio": "Centinela API"}
