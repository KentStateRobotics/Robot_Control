#include "usbConn.h"

usbConn foo;
void setup(){
  foo.start(9600);
}
void loop() {
  // put your main code here, to run repeatedly:
  int size = foo.readLoop();
  if(size){
    foo.write(foo.getBuffer(), size);
  }
}
