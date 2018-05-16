#include <ArduinoJson.h>
#include "usbConn.h"
#include "protocol.h"
<<<<<<< HEAD

usbConn conn;
char input[4];
char outBuffer[200];
void setup(){
  conn.start(19200);
=======
#include <Sabertooth.h>
#include <SoftwareSerial.h>

//ST1[0] Motor 1: Left
//ST1[0] Motor 2: Right
//ST1[1] Motor 1: Arm
//ST1[1] Motor 2: Bucket

SoftwareSerial SWSerial (NOT_A_PIN, 6);
Sabertooth ST1[2] = { Sabertooth(128, SWSerial), Sabertooth(129, SWSerial) };

usbConn conn;
void setup(){
  conn.start(9600);
  StaticJsonBuffer<200> jsonBuffer;
  pinMode(7, OUTPUT);
  digitalWrite(7, HIGH);
  SWSerial.begin(115200);
  ST1[0].autobaud();
  ST1[1].autobaud();
>>>>>>> origin/master
}
void loop() {
  
  // put your main code here, to run repeatedly:
  int size = conn.readLoop();
  if(size){
<<<<<<< HEAD
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(conn.getBuffer(), size);
    if(root.containsKey(protocol::motor::driveR)){
      input[0] = root[protocol::motor::driveR];
    }
    if(root.containsKey(protocol::motor::driveL)){
     input[1] = root[protocol::motor::driveL];
    }
    if(root.containsKey(protocol::motor::actWrist)){
      input[2] = root[protocol::motor::actWrist];
    }
    if(root.containsKey(protocol::motor::actElbow)){
     input[3] = root[protocol::motor::actElbow];
=======
    conn.write(conn.getBuffer(), size);
    JsonObject& root = jsonBuffer.parseObject(conn.getBuffer(), size);
    if(root[protocol.field.action] == protocol.action.command){
      if (root.containsKey(protocol.motor.driveL) {
        int driveLPower = root[protocol.field.motor][protocol.motor.driveL];
        ST1[0].motor(1, driveLPower);
      }
      if (root.containsKey(protocol.motor.driveR) {
        int driveRPower = root[protocol.field.motor][protocol.motor.driveR];
        ST1[0].motor(2, driveRPower);
      }
      if (root.containsKey(protocol.motor.actWrist) {
        int actWristPower = root[protocol.field.motor][protocol.motor.actWrist];
        ST1[0].motor(2, actWristPower / 2);
      }
      if (root.containsKey(protocol.motor.actElbow) {
        int actElbowPower = root[protocol.field.motor][protocol.motor.actElbow];
        ST1[0].motor(1, actElbowPower / 2);
      }
>>>>>>> origin/master
    }
  }
}
