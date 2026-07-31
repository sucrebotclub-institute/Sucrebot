// INSECTOS - ESP32 + 4x E18-D80NK (reemplaza Arduino Uno + Sharp GP2Y0A21YK0F)
// Protocolo: envia "C1".."C4" por cada cruce detectado, sin comandos de
// armado/reset (el frontend en INSECTOS/index.html solo escucha, no escribe).
// La senal de cada sensor debe llegar ya bajada a 3.3V (divisor/level shifter).

const int SENSOR_C1 = 16;
const int SENSOR_C2 = 17;
const int SENSOR_C3 = 18;
const int SENSOR_C4 = 19;

const int PINES[4] = { SENSOR_C1, SENSOR_C2, SENSOR_C3, SENSOR_C4 };

bool estadoAnterior[4];
unsigned long ultimoDebounce[4] = { 0, 0, 0, 0 };
const int DEBOUNCE_MS = 500;

void setup() {
  Serial.begin(115200);
  for (int i = 0; i < 4; i++) {
    pinMode(PINES[i], INPUT);
    estadoAnterior[i] = digitalRead(PINES[i]);
  }
}

void loop() {
  unsigned long ahora = millis();

  for (int i = 0; i < 4; i++) {
    bool estadoActual = digitalRead(PINES[i]);

    if (estadoActual == LOW && estadoAnterior[i] == HIGH) {
      if (ahora - ultimoDebounce[i] > DEBOUNCE_MS) {
        ultimoDebounce[i] = ahora;
        Serial.print("C");
        Serial.print(i + 1);
        Serial.print("\n");
      }
    }
    estadoAnterior[i] = estadoActual;
  }
}
