const int SENSOR    = 16;
const int LED_VERDE = 25;
const int LED_ROJO  = 26;

bool estadoAnterior      = HIGH;
unsigned long ultimoDebounce = 0;
const int DEBOUNCE_MS    = 50;

bool cronoActivo    = false;
bool esperandoStart = true;
bool listo          = false;
byte dato           = 0;

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR,    INPUT_PULLUP);
  pinMode(LED_VERDE, OUTPUT);
  pinMode(LED_ROJO,  OUTPUT);
  digitalWrite(LED_VERDE, LOW);
  digitalWrite(LED_ROJO,  HIGH);
}

void loop() {
  if (Serial.available()) {
    dato = Serial.read();

    if (dato == 'R') {
      listo          = true;
      cronoActivo    = false;
      esperandoStart = true;
      digitalWrite(LED_VERDE, HIGH);
      digitalWrite(LED_ROJO,  LOW);
      dato = 0;
    }
    if (dato == 'S') {
      listo          = false;
      cronoActivo    = false;
      esperandoStart = true;
      digitalWrite(LED_VERDE, LOW);
      digitalWrite(LED_ROJO,  HIGH);
      dato = 0;
    }
  }

  if (listo) {
    bool estadoActual = digitalRead(SENSOR);
    if (estadoActual == LOW && estadoAnterior == HIGH) {
      if (millis() - ultimoDebounce > DEBOUNCE_MS) {
        ultimoDebounce = millis();

        if (esperandoStart) {
          Serial.println("START");
          cronoActivo    = true;
          esperandoStart = false;
        } else {
          Serial.println("STOP");
          cronoActivo    = false;
          esperandoStart = true;
          listo          = false;
          digitalWrite(LED_VERDE, LOW);
          digitalWrite(LED_ROJO,  HIGH);
        }
      }
    }
    estadoAnterior = estadoActual;
  } else {
    estadoAnterior = digitalRead(SENSOR);
  }
}
