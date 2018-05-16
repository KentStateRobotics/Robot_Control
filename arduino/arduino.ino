#include <ArduinoJson.h>
#include "usbConn.h"
#include "protocol.h"
#include <Sabertooth.h>
//Signal Wire (White) pin 
//Power Wire (Red) pin VIN
//Ground Wire (Black) GND

//ST1[0] Motor 1: Left
//ST1[0] Motor 2: Right
//ST1[1] Motor 1: Arm
//ST1[1] Motor 2: Bucket
#define IS_MEGA true //Check as true to used Mega's additonal hardware serial
#define DEBUG false
#define MOTOR_CON_TIMEOUT 2000

usbConn conn;
#if IS_MEGA
  Sabertooth ST1[2] = { Sabertooth(128, Serial1), Sabertooth(129, Serial1) };
#else
  #include <SoftwareSerial.h>
  SoftwareSerial SWSerial (NOT_A_PIN, 9);
  Sabertooth ST1[2] = { Sabertooth(128, SWSerial), Sabertooth(129, SWSerial) };
#endif

void setup(){
  conn.start(19200);
  #if IS_MEGA
    Serial1.begin(9600);
  #else
    SWSerial.begin(9600);
    while(!SWSerial) {
      ;
    }
  #endif
  ST1[0].autobaud();
  ST1[1].autobaud();
  ST1[0].setTimeout(MOTOR_CON_TIMEOUT);
  ST1[1].setTimeout(MOTOR_CON_TIMEOUT);
}

void loop() {
  int size = conn.readLoop();
  if(size){
    #if DEBUG
      conn.write(conn.getBuffer(), size);
    #endif
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(conn.getBuffer(), size);
    if(root.containsKey(protocol::motor::driveR)){
      ST1[0].motor(2, int(root[protocol::motor::driveR]));
    }
    if(root.containsKey(protocol::motor::driveL)){
     ST1[0].motor(1, int(root[protocol::motor::driveL]));
    }
    if(root.containsKey(protocol::motor::actWrist)){
      ST1[1].motor(2, -1 * int(root[protocol::motor::actWrist]));
    }
    if(root.containsKey(protocol::motor::actElbow)){
      ST1[1].motor(1, int(root[protocol::motor::actElbow]));
    }
  }
}
