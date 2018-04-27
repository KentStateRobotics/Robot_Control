#include "usbConn.h"

void usbConn::write(const char* message, int length){
  char[2] header;
  header[0] = CON_CHAR;
  header[1] = calcChecksum(message, length);
  char[2] footer;
  footer[0] = CON_CHAR;
  footer[1] = END_CHAR;
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
        if(recChar == CON_CHAR){
          state = readCon;
        }else if(bufferLoc < bufferSize){
          buffer[bufferLoc] = recChar;
          ++bufferLoc;
        } 
      break;
      case notReading:
        if(recChar == CON_CHAR){
          timer = 0;
          bufferLoc = 0;
          state = readCheck;
        }
      break;
      case readCon:
        state = reading;
        if(recChar == CON_CHAR) {//Control byte was escaped
          buffer[bufferLoc] = recChar;
          ++bufferLoc;
        }else if(recChar == END_CHAR){ 
          state = notReading;
          char[2] ack;
          ack[0] = CON_CHAR;
          if(checksum == calcChecksum(buffer, bufferLoc)){
            ack[1] = ACK_CHAR;
          } else {
            ack[1] = NAK_CHAR;
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
