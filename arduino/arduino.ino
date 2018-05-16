#include <ArduinoJson.h>
#include "usbConn.h"
#include "protocol.h"

usbConn conn;
char input[4];
char outBuffer[200];
void setup(){
  conn.start(19200);
}
void loop() {
  
  // put your main code here, to run repeatedly:
  int size = conn.readLoop();
  if(size){
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
    }
  }
}
