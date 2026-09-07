// =============================================================
// CENTINELA SILVOPASTORIL - Alarma de incendios subterráneos
// Versión ESP32/ESP8266 con envío de datos a la API vía WiFi
// =============================================================
//
// Diferencias respecto al Arduino Uno original:
//  - Se usan pines ADC1 (34 y 35) porque son los únicos que
//    funcionan de forma confiable en paralelo con el WiFi.
//  - Se fija la resolución del ADC a 10 bits (0-1023) para que
//    UMBRAL_SECO y UMBRAL_GAS sigan siendo válidos tal cual.
//  - Cada cierto intervalo, además de sonar la alarma local,
//    se manda un POST a tu API con la lectura actual.
//
// Si usas un ESP8266 en vez de ESP32: cambia <WiFi.h> por
// <ESP8266WiFi.h> y <HTTPClient.h> por <ESP8266HTTPClient.h>,
// y usa los pines analógicos/digitales disponibles en tu placa
// (el ESP8266 solo tiene un pin analógico: A0).

#include <WiFi.h>
#include <HTTPClient.h>

// ---------- CONFIGURACIÓN QUE DEBES EDITAR ----------
const char* WIFI_SSID     = "TU_WIFI";
const char* WIFI_PASSWORD = "TU_PASSWORD";
const char* API_URL       = "https://TU-API.onrender.com/lecturas"; // sin barra final
// ------------------------------------------------------

const int PIN_SUELO   = 34; // ADC1_CH6 - seguro de usar junto con WiFi
const int PIN_MQ2     = 35; // ADC1_CH7 - seguro de usar junto con WiFi
const int PIN_BUZZER  = 25;
const int PIN_LED     = 26;

const int UMBRAL_SECO = 400; // por debajo de esto, el suelo se considera seco
const int UMBRAL_GAS  = 300; // por encima de esto, hay gas/humo relevante

const unsigned long INTERVALO_ENVIO = 30000UL; // enviar a la API cada 30s
unsigned long ultimoEnvio = 0;

void conectarWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Conectando a WiFi");
  unsigned long inicio = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - inicio < 15000) {
    delay(400);
    Serial.print(".");
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi conectado. IP: " + WiFi.localIP().toString());
  } else {
    Serial.println("\nNo se pudo conectar. Se reintentará en el loop.");
  }
}

void enviarLectura(int humedad, int gas, bool alarma) {
  if (WiFi.status() != WL_CONNECTED) {
    conectarWiFi();
    if (WiFi.status() != WL_CONNECTED) return;
  }

  HTTPClient http;
  http.begin(API_URL);
  http.addHeader("Content-Type", "application/json");

  String body = "{\"humedad_suelo\":" + String(humedad) +
                ",\"nivel_gas\":" + String(gas) +
                ",\"alarma_activa\":" + (alarma ? "true" : "false") + "}";

  int codigo = http.POST(body);
  Serial.print("POST /lecturas -> ");
  Serial.println(codigo);
  http.end();
}

void setup() {
  Serial.begin(9600);
  analogReadResolution(10); // compatibilidad con los umbrales originales (0-1023)

  pinMode(PIN_BUZZER, OUTPUT);
  pinMode(PIN_LED, OUTPUT);

  Serial.println("--- SISTEMA CENTINELA SILVOPASTORIL INICIADO ---");
  conectarWiFi();
  delay(1000);
}

void loop() {
  int lecturaSuelo = analogRead(PIN_SUELO);
  int lecturaGas   = analogRead(PIN_MQ2);

  Serial.print("Humedad del Suelo: ");
  Serial.print(lecturaSuelo);
  Serial.print(" | Nivel de Gas/Humo: ");
  Serial.println(lecturaGas);

  bool alarma = (lecturaSuelo < UMBRAL_SECO && lecturaGas > UMBRAL_GAS);

  if (alarma) {
    digitalWrite(PIN_LED, HIGH);
    tone(PIN_BUZZER, 500);
  } else {
    digitalWrite(PIN_LED, LOW);
    noTone(PIN_BUZZER);
  }

  if (millis() - ultimoEnvio >= INTERVALO_ENVIO) {
    enviarLectura(lecturaSuelo, lecturaGas, alarma);
    ultimoEnvio = millis();
  }

  delay(500);
}
