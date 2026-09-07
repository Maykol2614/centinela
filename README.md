# Centinela — Alerta de incendios subterráneos

Sistema de monitoreo con ESP32 que mide humedad de suelo y gas/humo (MQ-2), envía los datos a una API,
los guarda en Neon (PostgreSQL) y los muestra en un panel web en tiempo real.

```
ESP32 (WiFi) --POST--> API (FastAPI) --SQL--> Neon (Postgres)
                                                    ^
                                                    |
                                Frontend (React) ---+ (GET cada 10s)
```

## 1. Crear la base de datos en Neon

1. Crea una cuenta en https://neon.tech y un proyecto nuevo.
2. En el dashboard del proyecto, ve a **Connection Details** y copia la cadena de conexión
   ("Pooled connection"). Se ve así:
   `postgresql://usuario:password@ep-xxxxx.neon.tech/neondb?sslmode=require`
3. No necesitas crear tablas a mano: FastAPI las crea solas al arrancar (`Base.metadata.create_all`).

## 2. Desplegar el backend (carpeta `backend/`)

Puedes usar Render, Railway o cualquier host que corra Python:

1. Sube la carpeta `backend/` a un repositorio de GitHub.
2. En Render: **New Web Service** → conecta el repo → runtime Python.
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. En variables de entorno del servicio, agrega `DATABASE_URL` con tu connection string de Neon.
4. Cuando despliegue, prueba `https://tu-api.onrender.com/` — debe responder `{"status":"ok",...}`.

Para probar en local:
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # y pega tu DATABASE_URL de Neon
uvicorn main:app --reload
```

## 3. Desplegar el frontend (carpeta `frontend/`)

1. Sube la carpeta `frontend/` a GitHub (puede ser el mismo repo, en otra subcarpeta, o uno aparte).
2. En Vercel: **New Project** → importa el repo → Framework preset: Vite.
3. En **Environment Variables**, agrega `VITE_API_URL` con la URL de tu backend
   (ej. `https://tu-api.onrender.com`, sin barra final).
4. Deploy. Listo, tu panel queda en `https://tu-proyecto.vercel.app`.

Para probar en local:
```bash
cd frontend
npm install
cp .env.example .env   # y pon tu VITE_API_URL (o http://localhost:8000 si el backend corre local)
npm run dev
```

## 4. Configurar el ESP32 (`arduino/centinela_esp32.ino`)

1. Instala en el IDE de Arduino la placa "ESP32" (Boards Manager) y la librería HTTPClient (viene incluida
   con el core de ESP32).
2. Edita al inicio del archivo:
   - `WIFI_SSID` / `WIFI_PASSWORD`: tu red WiFi.
   - `API_URL`: la URL de tu backend + `/lecturas`, ej. `https://tu-api.onrender.com/lecturas`.
3. Revisa el cableado: en este sketch el sensor de suelo va al pin 34, el MQ-2 al pin 35,
   el buzzer al 25 y el LED al 26 (pines ADC1, compatibles con WiFi activo).
4. Sube el sketch. Abre el Monitor Serial a 9600 baudios para confirmar que se conecta al WiFi
   y que los `POST /lecturas` devuelven código 200.

## Endpoints de la API

| Método | Ruta              | Uso                                                            |
|--------|-------------------|-----------------------------------------------------------------|
| POST   | `/lecturas`       | El ESP32 envía `{humedad_suelo, nivel_gas, alarma_activa}`     |
| GET    | `/lecturas`       | Últimas N lecturas (para las gráficas)                          |
| GET    | `/lecturas/actual`| Última lectura (para el estado en vivo)                        |
| GET    | `/estadisticas`   | Día más húmedo/seco, promedios, total de alarmas activadas      |

## Ajustar los umbrales / clasificación

- `UMBRAL_SECO` y `UMBRAL_GAS` viven en tres lugares que deben coincidir: el `.ino`, y las zonas de
  color en `frontend/src/App.jsx` (`ZONAS_SUELO`, `ZONAS_GAS`). Si calibras el sensor y cambias los
  umbrales, actualiza los tres.
- La convención usada es: **humedad_suelo bajo = suelo seco**, **humedad_suelo alto = suelo húmedo**
  (igual que en tu sketch original). Si tu sensor da la lectura invertida, cambia la lógica en
  `backend/routers/estadisticas.py` (está señalado con un comentario) y las zonas del frontend.
