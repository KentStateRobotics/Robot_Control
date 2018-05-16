#include <ArduinoJson.h>
#include "usbConn.h"
#include "protocol.h"
#include <Sabertooth.h>

//Signal Wire (White) pin 6
//Power Wire (Red) pin 7
//Ground Wire (Black) GND

//5 Left
//9 Right
//10 Elbow
//11 Wrist

usbConn conn;
void setup(){
  conn.start(19200);
  pinMode(5, OUTPUT);
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(11, OUTPUT);
  pinMode(8, OUTPUT);
  digitalWrite(8, HIGH);
  analogWrite(5, 128);
  analogWrite(9, 128);
  analogWrite(10, 128);
  analogWrite(11, 128);
}

void loop() {
  int size = conn.readLoop();
  if(size){
    //conn.write("Still Running");
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(conn.getBuffer(), size);
    if(root.containsKey(protocol::motor::driveR)){
      analogWrite(9, int(root[protocol::motor::driveR]) + 128);
    }
    if(root.containsKey(protocol::motor::driveL)){
     analogWrite(5, int(root[protocol::motor::driveL]) + 128);
    }
    if(root.containsKey(protocol::motor::actWrist)){
      analogWrite(11, int(root[protocol::motor::actWrist]) + 128);
    }
    if(root.containsKey(protocol::motor::actElbow)){
      analogWrite(10, int(root[protocol::motor::actElbow]) + 128);
    }
  }
}
