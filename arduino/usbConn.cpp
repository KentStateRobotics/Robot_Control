#include "usbConn.h"

void usbConn::write(const char* message, int length){
  char[2] header;
  header[0] = usbConn.controlChar;
  header[1] = usbConn.calcChecksum(message, length);
  char[2] footer;
  footer[0] = usbConn.controlChar;
  footer[1] = usbConn.endChar;
  Serial.write(header, 2);
  Serial.write(message, length);
  Serial.write(footer, 2);
}

int usbConn::readLoop(){
  if(Serial.available()){
    char recChar = Serial.read();
    if(state != notReading && timeout < mills() - timer){
      state = notReading;
    }
    switch(state){
      case reading:
        if(recChar == controlChar){
          state = readCon;
        }else if(bufferLoc < bufferSize){
          buffer[bufferLoc] = recChar;
          ++bufferLoc;
        } 
      break;
      case notReading:
        if(recChar == controlChar){
          timer = 0;
          bufferLoc = 0;
          state = readCheck;
        }
      break;
      case readCon:
        state = reading;
        if(recChar == controlChar) {//Control byte was escaped
          buffer[bufferLoc] = recChar;
          ++bufferLoc;
        }else if(recChar == endChar){ 
          state = notReading;
          char[2] ack;
          ack[0] = usbConn.controlChar;
          if(usbConn.checksum == calcChecksum(buffer, bufferLoc)){
            ack[1] = usbConn.ackChar;
          } else {
            ack[1] = nackChar;
          }
          write(ack);
          return bufferLoc;
        }else{
          state = notReading;
        }
      break;
      case readCheck:
        state = reading;
        checksum = recChar;
      break;
    }
  }
  return 0;
}

char usbConn::calcChecksum(const char* message, int length){
  char checksum = 0;
  for(int i = 0; i < messageLength; ++i){
    checksum = checksum ^ buffer[i];
  }
  return checksum;
}
