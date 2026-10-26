import os
import time

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from auth import crear_token, iguales

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginIn(BaseModel):
    usuario: str
    password: str


@router.post("/login")
def login(datos: LoginIn):
    usuario_ok = os.getenv("APP_USER")
    password_ok = os.getenv("APP_PASSWORD")
    if not usuario_ok or not password_ok:
        raise HTTPException(status_code=500, detail="El acceso no está configurado en el servidor.")

    # Se comparan ambos campos siempre, para no revelar cuál falló.
    usuario_bien = iguales(datos.usuario, usuario_ok)
    password_bien = iguales(datos.password, password_ok)
    if not (usuario_bien and password_bien):
        time.sleep(1)  # frena los intentos de adivinar la contraseña
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos.")

    return {"token": crear_token(datos.usuario)}
