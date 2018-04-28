#include "usbConn.h"

void usbConn::write(const char* message, int length){
  char header[2];
  header[0] = CON_CHAR;
  header[1] = calcChecksum(message, length);
  char footer[2];
  footer[0] = CON_CHAR;
  footer[1] = END_CHAR;
  Serial.write(header, 2);
  Serial.write(message, length);
  Serial.write(footer, 2);
}
void usbConn::write(String message) {
    int length = message.length() + 1;
    char* temp = new char[length];
    message.toCharArray(temp, length);
    write(temp, length);
    delete[] temp;
}
int usbConn::readLoop(){
  if(Serial.available()){
    char recChar = Serial.read();
    if(state != readState::notReading && timeout < millis() - timer){
      state = readState::notReading;
    }
    switch(state){
      case readState::reading:
        if(recChar == CON_CHAR){
          state = readState::readCon;
        }else if(bufferLoc < bufferSize){
          buffer[bufferLoc] = recChar;
          ++bufferLoc;
        } 
      break;
      case readState::notReading:
        if(recChar == CON_CHAR){
          timer = millis();
          bufferLoc = 0;
          state = readState::readCheck;
        }
      break;
      case readState::readCon:
        state = readState::reading;
        if(recChar == CON_CHAR) {//Control byte was escaped
          buffer[bufferLoc] = recChar;
          ++bufferLoc;
        }else if(recChar == END_CHAR){ 
          state = readState::notReading;
          char ack[2];
          ack[0] = CON_CHAR;
          if(checksum == calcChecksum(buffer, bufferLoc)){
            ack[1] = ACK_CHAR;
          } else {
            ack[1] = NAK_CHAR;
            bufferLoc = 0;
          }
          if(enableRecAck){
            write(ack, 2);
          }
          return bufferLoc;
        }else{
          state = readState::notReading;
        }
      break;
      case readState::readCheck:
        state = readState::reading;
        checksum = recChar;
      break;
    }
  }
  return 0;
}
char usbConn::calcChecksum(const char* message, int length){
  char checksum = 0;
  for(int i = 0; i < length; ++i){
    checksum ^= message[i];
  }
  return checksum;
}