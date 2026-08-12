const int SENSOR    = 16;
const int LED_VERDE = 25;
const int LED_ROJO  = 26;

bool estadoAnterior      = HIGH;
unsigned long ultimoDebounce = 0;
const int DEBOUNCE_MS    = 1000;

bool cronoActivo = false;
byte dato        = 0;

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
      // Captura la línea base del sensor justo al momento de armar,
      // para evitar falsos negativos si la mano/robot ya estaba
      // frente al sensor cuando llegó el comando.
      estadoAnterior = digitalRead(SENSOR);
      cronoActivo = true;
      digitalWrite(LED_VERDE, HIGH);
      digitalWrite(LED_ROJO,  LOW);
      // Confirma al frontend que el sensor ya está armado y
      // escuchando — cierra la ventana de carrera entre el clic
      // de "Iniciar" y el momento real en que el ESP32 empieza
      // a vigilar el sensor.
      Serial.println("ARMED");
      dato = 0;
    }

    if (dato == 'S') {
      cronoActivo = false;
      digitalWrite(LED_VERDE, LOW);
      digitalWrite(LED_ROJO,  HIGH);
      dato = 0;
    }
  }

  if (cronoActivo) {
    bool estadoActual = digitalRead(SENSOR);
    if (estadoActual == LOW && estadoAnterior == HIGH) {
      if (millis() - ultimoDebounce > DEBOUNCE_MS) {
        ultimoDebounce = millis();
        Serial.println("STOP");
        cronoActivo = false;
        digitalWrite(LED_VERDE, LOW);
        digitalWrite(LED_ROJO,  HIGH);
      }
    }
    estadoAnterior = estadoActual;
  } else {
    estadoAnterior = digitalRead(SENSOR);
  }
}
