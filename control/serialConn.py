#Kent State Univeristy - RMC team
#Jared Butcher 2018
#
#Requires pySerial library
#Implements and reliable serial connection with flag bytes, checksum, and optional stop and wait acks 

import serial
import serial.tools.list_ports
import threading
import time
import json
import os
from enum import IntEnum, unique

class serialConn():
    CON_CHAR = '<'
    END_CHAR = '>'
    ACK_CHAR = 'a'
    NAK_CHAR = 'n'

    @unique
    class states(IntEnum):
        receiving = 0,
        notReceiving = 1,
        conReceiving = 2,
        checkReceiving = 3

    def __init__(self, recEvent=None, port=None, target="Arduino", bufferSize = 500, baud=19200, timeout = 1):
        self._port = port
        self._baud = baud
        self._buffer = bytearray(bufferSize)
        self._bufferLoc = 0
        self._state = self.states.notReceiving
        self._recEvent = []
        self._target = target
        self._timeout = timeout
        self._recTimer = 0
        if recEvent != None:
            self._recEvent.append(recEvent)
        self._conn = None
        self.connect()
    
    def connect(self):
        if self._port is None:
            if os.name == 'nt':
                ports = serial.tools.list_ports.comports()
                for p in ports:
                    if self._target in p[1]:
                        self._port = p[0]
            elif os.name == 'posix':
                ports = serial.tools.list_ports.comports()
                for port in ports:
                    if "ACM" in port.device:
                        self._port = port.device
            else:
                print("OS: " + os.name + " not reconized")
        if self._port != None:
            threading.Thread(target=self._start).start()
        
    def write(self, message, escape = True, ignoreQueue = False):
        """Sends stuff over the serial connection
        Args:
            message (str): stuff to send over serial
            escape (bool): automaticly escape flags
            ignoreQueue (bool): ignore the write queue and dont wait for an ack
        """
        if self._conn is None:
            print("Serial Send None: " + message)
            self.connect()
            return
        if(escape):
            i = 0
            while True:
                i = message.find(self.CON_CHAR, i)
                if i == -1: break
                message = message[:i] + self.CON_CHAR + message[i:]
                i += 2
        data = self.CON_CHAR + message + self.CON_CHAR + self.END_CHAR
        print("Serial Send: " + data)
        data = bytes(data, 'utf-8')
        self._conn.write(data)

    def _start(self):
        """Only for use internaly, ran at beinging of thread to start serial connection"""
        if self._port is None: return
        with serial.Serial(self._port, self._baud, timeout=self._timeout) as self._conn:
            while self._conn.is_open:
                self._read()

    def _read(self):
        """Only for use internaly, ran in thead to read and process input"""
        if(not self._conn.is_open): return
        char = str(self._conn.read().decode("utf-8"))
        if self._state == self.states.receiving:
            if char == self.CON_CHAR:
                self._state = self.states.conReceiving
            elif time.time() - self._recTimer > self._timeout:
                self._state = self.states.notReceiving
            else:
                self._buffer[self._bufferLoc] = ord(char)
                self._bufferLoc += 1
        elif self._state == self.states.conReceiving:
            if char == self.END_CHAR:
                data = str(self._buffer[0:self._bufferLoc].decode('utf-8'))
                if data != '':
                    print("RECEIVED: " + data)
                    #message = json.loads(data)
                    #for evt in self._recEvent:
                    #    evt(message)
                self._state = self.states.notReceiving
            elif char == self.CON_CHAR:
                self._buffer[self._bufferLoc] = ord(char)
                self._bufferLoc += 1
                self._state = self.states.receiving
        elif self._state == self.states.notReceiving:
            if char == self.CON_CHAR:
                self._state = self.states.receiving
                self._bufferLoc = 0
                self._recTimer = time.time()

    def recEventAdd(self, event):
        self._recEvent.append(event)

    def recEventRemove(self, event):
        self._recEvent.remove(event)


'''Uncomment to use this file standalong for Network debuging
def foo(message):
    print(message)

bar = serialConn(foo)
while True:
    bar.write(input())
'''