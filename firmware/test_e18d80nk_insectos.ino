// Test de diagnostico para 4x E18-D80NK en ESP32 (candidatos a reemplazar
// el Sharp GP2Y0A21YK0F de INSECTOS). Recordatorio: la senal de salida de
// cada sensor debe estar ya bajada a 3.3V (divisor resistivo o level
// shifter) antes de llegar a estos pines - los GPIO del ESP32 no toleran 5V.

const int SENSOR_C1 = 16;
const int SENSOR_C2 = 17;
const int SENSOR_C3 = 18;
const int SENSOR_C4 = 19;

const int PINES[4]     = { SENSOR_C1, SENSOR_C2, SENSOR_C3, SENSOR_C4 };
const char* NOMBRES[4]  = { "C1", "C2", "C3", "C4" };

bool estadoAnterior[4];
unsigned long ultimoDebounce[4] = { 0, 0, 0, 0 };
const int DEBOUNCE_MS = 50;

unsigned long ultimoReporteEstado = 0;

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 4; i++) {
    pinMode(PINES[i], INPUT);
    estadoAnterior[i] = digitalRead(PINES[i]);
  }
  Serial.println("Test E18-D80NK iniciado. Estado inicial de los 4 canales:");
  for (int i = 0; i < 4; i++) {
    Serial.print(NOMBRES[i]);
    Serial.print(": ");
    Serial.println(estadoAnterior[i] == LOW ? "DETECTA (LOW)" : "libre (HIGH)");
  }
}

void loop() {
  unsigned long ahora = millis();

  for (int i = 0; i < 4; i++) {
    bool estadoActual = digitalRead(PINES[i]);

    if (estadoActual != estadoAnterior[i] && ahora - ultimoDebounce[i] > DEBOUNCE_MS) {
      ultimoDebounce[i] = ahora;
      Serial.print(NOMBRES[i]);
      Serial.println(estadoActual == LOW ? " -> DETECTADO" : " -> libre");
      estadoAnterior[i] = estadoActual;
    }
  }

  // Reporte periodico de los 4 estados a la vez, util para verificar
  // que ningun canal quede "pegado" en un valor por mal contacto o
  // nivel de voltaje incorrecto.
  if (ahora - ultimoReporteEstado > 2000) {
    ultimoReporteEstado = ahora;
    Serial.print("Estado actual -> ");
    for (int i = 0; i < 4; i++) {
      Serial.print(NOMBRES[i]);
      Serial.print(":");
      Serial.print(digitalRead(PINES[i]) == LOW ? "DET " : "libre ");
    }
    Serial.println();
  }
}
