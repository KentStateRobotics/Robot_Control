import serial
import threading
import time
from enum import IntEnum, unique

class serialConn():
    """Communicates with arduino over serial. Will start a new thread
    Args:
        port (int): serial port to connect to
        recEvent (method): event to fire when message is received (foo(message))
    """
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

    def __init__(self, port, recEvent, bufferSize = 100, baud=9600, timeout=1, enableSendAck = True, enableRecAck = False):
        self.enableSendAck = enableSendAck
        self.enableRecAck = enableRecAck
        self._port = port
        self._baud = baud
        self._timeout = timeout
        self._buffer = bytearray(bufferSize)
        self._bufferLoc = 0
        self._state = self.states.notReceiving
        self._recEvent = recEvent
        self._nonAckMessage = None
        self._ackTimer = 0
        self._recTimer = 0
        self._checksum = 0
        self._queuedMessaegs = []
        threading.Thread(target=self._start).start()
    def write(self, message, ignoreQueue = False):
        """Sends stuff over the serial connection
        Args:
            message (str): stuff to send over serial
            ignoreQueue (bool): ignore the write queue and dont wait for an ack
        """
        print("send: " + message)
        data = self.CON_CHAR + self.calcChecksum(message) + message + self.CON_CHAR + self.END_CHAR
        data = bytes(data, 'utf-8')
        if not ignoreQueue and self._nonAckMessage != None and self._nonAckMessage != message:
            self._queuedMessaegs.append((message, time.time()))
        elif ignoreQueue:
            self._conn.write(data)
        else:
            self._nonAckMessage = message
            self._ackTimer = time.time()
            self._conn.write(data)
    def calcChecksum(self, data):
        """Creates a one byte checksum from each byte in input
        Args:
            data (str): stuff to calculate the checksum of
        Return:
            (char) checksum 
        """
        checksum = 0
        if type(data) is str:
            data = bytes(data, 'utf-8')
        for i in range(len(data)):
            checksum ^= data[i]
        return chr(checksum)
    def _start(self):
        """Only for use internaly, ran at beinging of thread to start serial connection"""
        with serial.Serial(self._port, self._baud, timeout=self._timeout) as self._conn:
            while self._conn.is_open:
              self._read()    
    def _read(self):
        """Only for use internaly, ran in thead to read and process input"""
        char = str(self._conn.read().decode("utf-8"))
        if self._state == self.states.receiving:
            if char == self.CON_CHAR:
                self._state = self.states.conReceiving
            elif time.time() - self._recTimer > self._timeout:
                self._state = self.states.notReceiving
                if self.enableRecAck:
                    self.write(self.CON_CHAR + self.NAK_CHAR, True)
            else:
                self._buffer[self._bufferLoc] = ord(char)
                self._bufferLoc += 1
        elif self._state == self.states.conReceiving:
            self._state = self.states.receiving
            if char == self.END_CHAR:
                data = str(self._buffer[0:self._bufferLoc].decode('utf-8'))
                if data != '':
                    self._recEvent(data)
                self._state = self.states.notReceiving
            elif self.enableSendAck and char == self.ACK_CHAR:
                if len(self._queuedMessaegs) == 0:
                    self._nonAckMessage = None
                else:
                    message = self._queuedMessaegs.pop(0)
                    self._nonAckMessage = message[0]
                    self._ackTimer = time.time()
                    self._conn.write(self._nonAckMessage)
            elif self.enableSendAck and char == self.NAK_CHAR:
                self.write(self._nonAckMessage)
                self._ackTimer = time.time()
            elif char == self.CON_CHAR:
                self._buffer[self._bufferLoc] = ord(char)
                self._bufferLoc += 1
        elif self._state == self.states.checkReceiving:
            self._state = self.states.receiving
            self._checksum = char
        elif self._state == self.states.notReceiving:
            if char == self.CON_CHAR:
                self._state = self.states.checkReceiving
                self._bufferLoc = 0
                self._recTimer = time.time()
        for message, timer in self._queuedMessaegs:
            if time.time() - timer > self._timeout:
                print("sending")
                self._queuedMessaegs.remove((message, timer))
        if self._nonAckMessage and time.time() - self._ackTimer > self._timeout:
            self.write(self._nonAckMessage)
            self._ackTimer = time.time()

def bar(message):
    print("received:")
    print(message)

foo = serialConn('COM6', bar, timeout=5)
while True:
    value = input()
    print("INPUT: " + value + "\n")
    foo.write(value)