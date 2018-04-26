#ifndef usbConn_h 
#define usbConn_h

#define bufferSize 100

#include "Arduino.h"

class serialConn{
    public:
        serialConn(int baud){ Serial.begin(baud); };
        ~serialConn(){ 
            Serial.close();
            delete[] buffer; 
        };
        void write(const char* message, int length);
        int readLoop(); //Run this on each iteration of loop, if it does not return 0 there is stuff to read
        const char* getBuffer() { return buffer; };
        void setTimeout(int timeout){ this.timeout = timeout; };
    private:
        const char controlChar = '<';
        const char endChar = '>';
        const char ackChar = 'a';
        const char nackChar = 'n';
        char* buffer = new char[bufferSize];
        int bufferLoc = 0;
        int timer = 0;
        int timeout = 1000;
        char checksum = 0;
        enum readState{notReading, readCheck, readCon, reading};
        readState state = notReading;

        char checkChecksum(const char message[], int length);
}

#endif