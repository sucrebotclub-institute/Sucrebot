const int PIN_A = 27;
const int PIN_B = 16;

#define EST_ESPERAR_R        0
#define EST_ESPERAR_MANOS    1
#define EST_LISTO            2
#define EST_CORRIENDO        3

int estado = EST_ESPERAR_R;
bool esperandoSegundo = false;
bool esperandoStop = false;
unsigned long tiempoEspera = 0;
unsigned long tiempoStop = 0;
const unsigned long VENTANA_MS = 150;

void setup() {
  Serial.begin(115200);
  pinMode(PIN_A, INPUT_PULLUP);
  pinMode(PIN_B, INPUT_PULLUP);
}

void loop() {
  if (Serial.available() > 0) {
    char cmd = Serial.read();
    if (cmd == 'R') {
      estado = EST_ESPERAR_MANOS;
      esperandoSegundo = false;
      esperandoStop = false;
    }
  }

  bool A = digitalRead(PIN_A);
  bool B = digitalRead(PIN_B);

  switch (estado) {
    case EST_ESPERAR_R:
      break;

    case EST_ESPERAR_MANOS:
      if (A == LOW && B == LOW) {
        estado = EST_LISTO;
        esperandoSegundo = false;
      }
      break;

    case EST_LISTO:
      if (!esperandoSegundo && (A == HIGH || B == HIGH)) {
        esperandoSegundo = true;
        tiempoEspera = millis();
      }
      if (esperandoSegundo) {
        if (A == HIGH && B == HIGH) {
          estado = EST_CORRIENDO;
          esperandoSegundo = false;
          esperandoStop = false;
          Serial.print("START\n");
          Serial.flush();
          delay(150);
        } else if (millis() - tiempoEspera > VENTANA_MS) {
          esperandoSegundo = false;
          estado = EST_ESPERAR_MANOS;
        }
      }
      break;

    case EST_CORRIENDO:
      if (!esperandoStop && (A == LOW || B == LOW)) {
        esperandoStop = true;
        tiempoStop = millis();
      }
      if (esperandoStop) {
        if (A == LOW && B == LOW) {
          estado = EST_ESPERAR_R;
          esperandoStop = false;
          Serial.print("STOP\n");
          Serial.flush();
          delay(150);
        } else if (millis() - tiempoStop > VENTANA_MS) {
          esperandoStop = false;
        }
      }
      break;
  }

  delay(5);
}
