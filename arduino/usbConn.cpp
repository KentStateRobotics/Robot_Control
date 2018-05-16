#include "usbConn.h"

void usbConn::write(const char* message, int length, bool escape){
  if(length > bufferSize){
    return;
  }
  char footer[2];
  footer[0] = CON_CHAR;
  footer[1] = END_CHAR;
  if(escape){
    char* tempBuffer = new char[bufferSize];
    int i = 0;
    int k = 0;
    while(i < length){
      tempBuffer[k] = message[i];
      if(message[i] == CON_CHAR){
        tempBuffer[++k] = CON_CHAR;
      }
      ++i;
      ++k;
      if(k > bufferSize){
        delete[] tempBuffer;
        return;
      }
    }
    Serial.write(CON_CHAR);
    Serial.write(tempBuffer, k);
    delete[] tempBuffer;
  } else {
    Serial.write(CON_CHAR);
    Serial.write(message, length);
  }
  Serial.write(footer, 2);
}
void usbConn::write(String message, bool escape) {
    int length = message.length() + 1;
    char* temp = new char[length];
    message.toCharArray(temp, length);
    write(temp, length, escape);
    delete[] temp;
}
int usbConn::readLoop(){
  if(Serial.available()){
    char recChar = Serial.read();
    if(timeout < millis() - timer){
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
          state = readState::reading;
        }
      break;
      case readState::readCon:
        state = readState::reading;
        if(recChar == CON_CHAR) {//Control byte was escaped
          buffer[bufferLoc] = recChar;
          ++bufferLoc;
        }else if(recChar == END_CHAR){ 
          state = readState::notReading;
          return bufferLoc;
        }else{
          state = readState::notReading;
        }
      break;
    }
  }
  return 0;
}
