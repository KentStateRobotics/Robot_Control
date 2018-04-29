//usbConn
//Kent State Univeristy - RMC team
//Jared Butcher 2018
//
//Implements a realable serial connection with flag bytes, checksum, and optional stop and wait acks

#ifndef RMC_ARDUINO_USBCONN_H_
#define RMC_ARDUINO_USBCONN_H_

#include <Arduino.h>

class usbConn{
    public:
        usbConn() : usbConn(100, true, false) {};
        usbConn(int bufferSize, bool enableRecAck, bool enableSendAck){
            //enableRecAck: send an ack for every received message NOT IMPLENTED
            //enableSendAck: wait for an ack after every received message NOT IMPLIMENTD
            this->bufferSize = 100;
            this->buffer = new char[bufferSize];
            this->enableRecAck = enableRecAck;
            this->enableSendAck = enableSendAck;
        };
        ~usbConn(){
            Serial.flush();
            Serial.end();
            delete[] buffer;
        };
        void start(int baud){ Serial.begin(baud); }; //Starts serial connection
        void start(){ start(9600); };
        //Write message to serial with flags and checksum
        //escape: automaticly escape all flag bytes
        void write(const char* message, int length, bool escape = true); 
        void write(String message, bool escape = true);
        int readLoop(); //Run this on each iteration of loop, returns how many bytes to read out of buffer
        //if it returns 0 pass
        const char* getBuffer() { return buffer; }; //Get the buffer
        void setTimeout(int timeout){ this->timeout = timeout; }; //Set the timeout for receive and ack
    private:
        const char CON_CHAR = '<';
        const char END_CHAR = '>';
        const char ACK_CHAR = 'a';
        const char NAK_CHAR = 'n';
        int bufferSize = 0;
        bool enableRecAck = true;
        bool enableSendAck = true;
        char* buffer = 0;
        int bufferLoc = 0;
        int timer = 0;
        int timeout = 1000;
        char checksum = 0;
        enum class readState{notReading, readCheck, readCon, reading};
        readState state = readState::notReading;

        char calcChecksum(const char message[], int length);
};
#endif
