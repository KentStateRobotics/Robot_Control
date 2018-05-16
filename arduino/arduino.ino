#include <ArduinoJson.h>
#include "usbConn.h"
#include "protocol.h"
#include <Sabertooth.h>
//#include <SoftwareSerial.h>

//Signal Wire (White) pin 6
//Power Wire (Red) pin 7
//Ground Wire (Black) GND

//ST1[0] Motor 1: Left
//ST1[0] Motor 2: Right
//ST1[1] Motor 1: Arm
//ST1[1] Motor 2: Bucket

//SoftwareSerial SWSerial (NOT_A_PIN, 9);
//Sabertooth ST1[2] = { Sabertooth(128, SWSerial), Sabertooth(129, SWSerial) };
Sabertooth ST1[2] = { Sabertooth(128, Serial1), Sabertooth(129, Serial1) };

void(* resetFunc) (void) = 0;

usbConn conn;
void setup(){
  conn.start(19200);
  pinMode(10, OUTPUT);
  digitalWrite(10, HIGH);
  Serial1.begin(9600);
  
  /*SWSerial.begin(9600);
  while(!SWSerial) {
    ;
  }*/
  
  ST1[0].autobaud();
  ST1[1].autobaud();
  ST1[0].setTimeout(1000);
  ST1[1].setTimeout(1000);
}

/*void serialFlush(){
  while(SWSerial.available() > 0) {
    char t = SWSerial.read();
  }
} */

void loop() {
  //SWSerial.begin(9600);
  int size = conn.readLoop();
  
  if(size){
    //conn.write("Still Running");
    StaticJsonBuffer<200> jsonBuffer;
    JsonObject& root = jsonBuffer.parseObject(conn.getBuffer(), size);
    if(root.containsKey(protocol::motor::driveR)){
      ST1[0].motor(2, int(root[protocol::motor::driveR]));
    }
    if(root.containsKey(protocol::motor::driveL)){
     ST1[0].motor(1, int(root[protocol::motor::driveL]));
    }
    if(root.containsKey(protocol::motor::actWrist)){
      ST1[1].motor(2, int(root[protocol::motor::actWrist]));
    }
    if(root.containsKey(protocol::motor::actElbow)){
      ST1[1].motor(1, int(root[protocol::motor::actElbow]));
    }

    //serialFlush();
    //SWSerial.close();
  }
}
