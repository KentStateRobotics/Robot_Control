#ifndef usbConn_h 
#define usbConn_h

#define bufferSize 100

#include "Arduino.h"

class usbConn{
    public:
        usbConn() : usbConn(true, false) {};
        usbConn(bool enableRecAck, bool enableSendAck){
            this->enableRecAck = enableRecAck;
            this->enableSendAck = enableSendAck;
        };
        ~usbConn(){
            Serial.flush();
            Serial.end();
            delete[] buffer;
        };
        void start(int baud){ Serial.begin(baud); };
        void start(){ start(9600); };
        void write(const char* message, int length);
        void write(String message);
        int readLoop(); //Run this on each iteration of loop, if it does not return 0 there is stuff to read
        const char* getBuffer() { return buffer; };
        void setTimeout(int timeout){ this->timeout = timeout; };
    private:
        const char CON_CHAR = '<';
        const char END_CHAR = '>';
        const char ACK_CHAR = 'a';
        const char NAK_CHAR = 'n';
        bool enableRecAck = true;
        bool enableSendAck = true;
        char* buffer = new char[bufferSize];
        int bufferLoc = 0;
        int timer = 0;
        int timeout = 1000;
        char checksum = 0;
        enum readState{notReading, readCheck, readCon, reading};
        readState state = notReading;

        char calcChecksum(const char message[], int length);
};

#endif
