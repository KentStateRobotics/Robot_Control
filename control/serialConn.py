import serial
import serial.tools.list_ports
import threading
import time
from enum import IntEnum, unique

class serialConn():
    """Communicates with arduino over serial. Will start a new thread
    Args:
        recEvent (method): event to fire when message is received (foo(message))
        target (str): search though ports and find one with device with the target in its discription
        port (str): overides target and connects to specifed port
        bufferSize (int): size of receive buffer and max send amount
        baud (int): serial data rate
        timeout (float): send, receive, ack timeouts seconds
        enableSendAck (bool): await an ack on all sent frames
        enableRecAck (bool): send ack on all received frames NOT IMPLEMENTED
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

    def __init__(self, recEvent, port=None, target="Arduino", bufferSize = 100, baud=9600, timeout=1, enableSendAck = True, enableRecAck = False):
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
        if port is None:
            ports = serial.tools.list_ports.comports()
            for p in ports:
                if target in p[1]:
                    port = p[0]
                    break
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
        if self.enableSendAck:
            for message, timer in self._queuedMessaegs:
                if time.time() - timer > self._timeout:
                    print("sending")
                    self._queuedMessaegs.remove((message, timer))
            if self._nonAckMessage and time.time() - self._ackTimer > self._timeout:
                self.write(self._nonAckMessage)
                self._ackTimer = time.time()