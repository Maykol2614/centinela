"""Autenticación de Centinela (sin dependencias extra).

- Panel web: usuario y contraseña -> token firmado (HMAC-SHA256) que dura 7 días.
- ESP32: clave de dispositivo en el header X-API-Key (opcional, ver DEVICE_API_KEY).

Variables de entorno (se configuran en Render):
  APP_USER, APP_PASSWORD  -> credenciales del panel
  SECRET_KEY              -> texto largo y aleatorio para firmar los tokens
  DEVICE_API_KEY          -> clave que enviará el ESP32 (si no existe, POST /lecturas queda abierto)
"""
import base64
import hashlib
import hmac
import json
import os
import time
from typing import Optional

from fastapi import Header, HTTPException

DURACION_TOKEN = 60 * 60 * 24 * 7  # 7 días


def _b64(datos: bytes) -> str:
    return base64.urlsafe_b64encode(datos).rstrip(b"=").decode()


def _des_b64(texto: str) -> bytes:
    return base64.urlsafe_b64decode(texto + "=" * (-len(texto) % 4))


def _secreto() -> bytes:
    secreto = os.getenv("SECRET_KEY")
    if not secreto:
        raise HTTPException(status_code=500, detail="Falta SECRET_KEY en el servidor.")
    return secreto.encode("utf-8")


def _firmar(payload: str) -> str:
    return _b64(hmac.new(_secreto(), payload.encode(), hashlib.sha256).digest())


def crear_token(usuario: str) -> str:
    cuerpo = json.dumps({"sub": usuario, "exp": int(time.time()) + DURACION_TOKEN})
    payload = _b64(cuerpo.encode())
    return f"{payload}.{_firmar(payload)}"


def validar_token(token: str) -> Optional[str]:
    _secreto()  # si falta SECRET_KEY, falla con 500 (no con 401)
    try:
        payload, firma = token.split(".")
        if not hmac.compare_digest(firma, _firmar(payload)):
            return None
        datos = json.loads(_des_b64(payload))
        if datos["exp"] < time.time():
            return None
        return datos["sub"]
    except Exception:
        return None


def iguales(a: str, b: str) -> bool:
    """Comparación en tiempo constante."""
    return hmac.compare_digest(a.encode("utf-8"), b.encode("utf-8"))


def requiere_usuario(authorization: Optional[str] = Header(None)) -> str:
    """Protege las rutas que lee el panel."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="No autenticado.")
    usuario = validar_token(authorization[7:])
    if usuario is None:
        raise HTTPException(status_code=401, detail="Sesión inválida o vencida.")
    return usuario


def requiere_dispositivo(x_api_key: Optional[str] = Header(None)) -> None:
    """Protege el POST del ESP32. Si DEVICE_API_KEY no está definida, no exige nada."""
    clave = os.getenv("DEVICE_API_KEY")
    if not clave:
        return
    if not x_api_key or not iguales(x_api_key, clave):
        raise HTTPException(status_code=401, detail="Clave de dispositivo inválida.")
