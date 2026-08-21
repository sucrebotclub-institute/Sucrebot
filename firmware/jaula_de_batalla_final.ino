#include <IRremote.hpp>
#include <MD_Parola.h>
#include <MD_MAX72XX.h>
#include <SPI.h>

// ─────────────────────────────────────────────────────────────
//  CONFIGURACIÓN DE TIEMPOS
// ─────────────────────────────────────────────────────────────
#define TIEMPO_CICLO_MS        5000   // 5 segundos para Btn 0
#define TIEMPO_R1_TEXTO_MS     3000   // 3 segundos "ROUND 1"
#define TIEMPO_R1_LUCES_MS     5000   // 5 segundos luces encendidas
#define TIEMPO_ROUND_MS        180000 // 3 minutos de combate
#define TIEMPO_CUENTA_MS       1000   // 1 segundo por número (1 al 10)

// ─────────────────────────────────────────────────────────────
//  PINES
// ─────────────────────────────────────────────────────────────
#define IR_RECV_PIN      4
#define DIN_PIN         23
#define CLK_PIN         18
#define CS_PIN          27
#define NUM_DEVICES      8

#define RELE_LUZ1_PIN   25
#define RELE_LUZ2_PIN   26
#define RELE_TIMBRE_PIN 14

#define RELE_ACTIVO     HIGH    
#define RELE_INACTIVO   LOW   

// ─────────────────────────────────────────────────────────────
//  CÓDIGOS IR (Mantén los que ya tenías configurados)
// ─────────────────────────────────────────────────────────────
#define BTN_0    0xE916FF00
#define BTN_1    0xF30CFF00
#define BTN_2    0xE718FF00
#define BTN_3    0xA15EFF00

// ─────────────────────────────────────────────────────────────
//  MAQUINA DE ESTADOS
// ─────────────────────────────────────────────────────────────
enum EstadoSistema {
  EST_IDLE,          // Estado base, muestra "SUCREBOT"
  EST_CICLO_0,       // Btn 0: Cicla SUCREBOT / BATALLA 3LB
  EST_R1_TEXTO,      // Btn 1: Muestra "ROUND 1" (3s)
  EST_R1_LUCES,      // Btn 1: Luces ON (5s)
  EST_R1_CRONOMETRO, // Btn 1: Cronómetro 3 minutos
  EST_CUENTA_1_10,   // Btn 2: Cuenta 1, 2, 3... 10
  EST_KO,            // Btn 2: Muestra K.O y suena timbre
  EST_FIN            // Btn 3: Termina encuentro inmediatamente
};

EstadoSistema estadoActual = EST_IDLE;

// ─────────────────────────────────────────────────────────────
//  VARIABLES DE CONTROL
// ─────────────────────────────────────────────────────────────
unsigned long tiempoInicio = 0;
unsigned long tiempoRestante = 0;
unsigned long ultimoCambio = 0;

bool mostrarSucrebot = true;
int cuentaActual = 0;
int segundoAnterior = -1; // Para evitar parpadeo en el cronómetro

// ─────────────────────────────────────────────────────────────
//  OBJETO MATRIZ
// ─────────────────────────────────────────────────────────────
MD_Parola matriz = MD_Parola(MD_MAX72XX::FC16_HW, DIN_PIN, CLK_PIN, CS_PIN, NUM_DEVICES);

// ─────────────────────────────────────────────────────────────
//  PROTOTIPOS
// ─────────────────────────────────────────────────────────────
void mostrarTextoFijo(const char* txt);
void procesarBoton(uint32_t codigo);
void apagarTodo();
void campanaKO();

// ============================================================
//  SETUP
// ============================================================
void setup() {
  Serial.begin(115200);
  
  pinMode(RELE_LUZ1_PIN, OUTPUT);
  pinMode(RELE_LUZ2_PIN, OUTPUT);
  pinMode(RELE_TIMBRE_PIN, OUTPUT);
  
  apagarTodo();

  IrReceiver.begin(IR_RECV_PIN, ENABLE_LED_FEEDBACK);

  matriz.begin();
  matriz.setIntensity(8);
  matriz.displayClear();
  
  mostrarTextoFijo("SUCREBOT");
  Serial.println("Sistema listo. Esperando comando IR...");
}

// ============================================================
//  LOOP PRINCIPAL
// ============================================================
void loop() {
  // 1. Procesar animación de la matriz (DEBE IR SIEMPRE)
  matriz.displayAnimate();

  // 2. Leer control remoto
  if (IrReceiver.decode()) {
    if (!(IrReceiver.decodedIRData.flags & IRDATA_FLAGS_IS_REPEAT)) {
      uint32_t cod = IrReceiver.decodedIRData.decodedRawData;
      Serial.print("IR Recibido: 0x"); Serial.println(cod, HEX);
      procesarBoton(cod);
    }
    IrReceiver.resume();
  }

  // 3. Máquina de estados basada en tiempo (No bloqueante)
  unsigned long ahora = millis();

  switch (estadoActual) {
    
    case EST_CICLO_0:
      if (ahora - tiempoInicio >= TIEMPO_CICLO_MS) {
        tiempoInicio = ahora;
        mostrarSucrebot = !mostrarSucrebot;
        if (mostrarSucrebot) {
          mostrarTextoFijo("SUCREBOT");
        } else {
          mostrarTextoFijo("BATALLA 3LB");
        }
      }
      break;

    case EST_R1_TEXTO:
      if (ahora - tiempoInicio >= TIEMPO_R1_TEXTO_MS) {
        estadoActual = EST_R1_LUCES;
        tiempoInicio = ahora;
        digitalWrite(RELE_LUZ1_PIN, RELE_ACTIVO);
        digitalWrite(RELE_LUZ2_PIN, RELE_ACTIVO);
        mostrarTextoFijo("GO!");
      }
      break;

    case EST_R1_LUCES:
      if (ahora - tiempoInicio >= TIEMPO_R1_LUCES_MS) {
        // Opcional: Si quieres que las luces se apaguen después de 5s, descomenta la siguiente línea.
        // Si deben quedar encendidas durante la pelea, déjala comentada.
        // digitalWrite(RELE_LUZ1_PIN, RELE_INACTIVO);
        // digitalWrite(RELE_LUZ2_PIN, RELE_INACTIVO);
        
        estadoActual = EST_R1_CRONOMETRO;
        tiempoInicio = ahora;
        tiempoRestante = TIEMPO_ROUND_MS;
        segundoAnterior = -1; // Resetear para forzar primera actualización
      }
      break;

    case EST_R1_CRONOMETRO:
      if (ahora - tiempoInicio >= tiempoRestante) {
        tiempoRestante = 0;
      } else {
        tiempoRestante = TIEMPO_ROUND_MS - (ahora - tiempoInicio);
      }

      // Actualizar display solo cuando cambia el segundo para evitar parpadeo
      int segActual = tiempoRestante / 1000;
      if (segActual != segundoAnterior) {
        segundoAnterior = segActual;
        int min = segActual / 60;
        int seg = segActual % 60;
        char buf[10];
        snprintf(buf, sizeof(buf), "%02d:%02d:0", min, seg);
        mostrarTextoFijo(buf);
      }

      if (tiempoRestante == 0) {
        estadoActual = EST_FIN;
        apagarTodo();
        mostrarTextoFijo("FIN");
        campanaKO();
      }
      break;

    case EST_CUENTA_1_10:
      if (ahora - ultimoCambio >= TIEMPO_CUENTA_MS) {
        ultimoCambio = ahora;
        cuentaActual++;
        
        char buf[5];
        snprintf(buf, sizeof(buf), "%d", cuentaActual);
        mostrarTextoFijo(buf);

        if (cuentaActual >= 10) {
          estadoActual = EST_KO;
          tiempoInicio = ahora;
          mostrarTextoFijo("K.O");
          campanaKO();
        }
      }
      break;

    case EST_KO:
      // Se queda en K.O hasta que se presione otro botón (ej. Btn 0 o 3)
      break;

    case EST_FIN:
      // Se queda en FIN hasta que se presione otro botón
      break;
      
    case EST_IDLE:
      // No hace nada, espera un botón
      break;
  }
}

// ============================================================
//  PROCESAR BOTONES
// ============================================================
void procesarBoton(uint32_t codigo) {
  if (codigo == BTN_0) {
    estadoActual = EST_CICLO_0;
    tiempoInicio = millis();
    mostrarSucrebot = true;
    mostrarTextoFijo("SUCREBOT");
  } 
  else if (codigo == BTN_1) {
    estadoActual = EST_R1_TEXTO;
    tiempoInicio = millis();
    mostrarTextoFijo("ROUND 1");
  } 
  else if (codigo == BTN_2) {
    estadoActual = EST_CUENTA_1_10;
    cuentaActual = 0;
    ultimoCambio = millis();
    mostrarTextoFijo("1");
  } 
  else if (codigo == BTN_3) {
    estadoActual = EST_FIN;
    apagarTodo();
    mostrarTextoFijo("FIN");
    // Opcional: Sonar timbre al terminar anticipadamente
    // campanaKO(); 
  }
}

// ============================================================
//  FUNCIONES AUXILIARES
// ============================================================
void mostrarTextoFijo(const char* txt) {
  matriz.displayClear();
  matriz.displayText(txt, PA_CENTER, 0, 0, PA_PRINT, PA_NO_EFFECT);
  matriz.displayReset();
}

void apagarTodo() {
  digitalWrite(RELE_LUZ1_PIN, RELE_INACTIVO);
  digitalWrite(RELE_LUZ2_PIN, RELE_INACTIVO);
  digitalWrite(RELE_TIMBRE_PIN, RELE_INACTIVO);
}

void campanaKO() {
  Serial.println("SONANDO TIMBRE K.O");
  // Toque largo
  digitalWrite(RELE_TIMBRE_PIN, RELE_ACTIVO);
  delay(600);
  digitalWrite(RELE_TIMBRE_PIN, RELE_INACTIVO);
  delay(200);
  // Repique final
  digitalWrite(RELE_TIMBRE_PIN, RELE_ACTIVO);
  delay(150);
  digitalWrite(RELE_TIMBRE_PIN, RELE_INACTIVO);
}
