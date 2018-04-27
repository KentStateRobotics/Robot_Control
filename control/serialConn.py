import serial
import threading
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
        
        receiving
        notReceiving
        waiting
        conReceiving
        checkReceiving

    def __init__(self, port, recEvent, bufferSize = 100, baud=9600, timeout=1, enableSendAck = True, enableRecAck = True):
        self.enableSendAck = enableSendAck
        self.enableRecAck = enableRecAck
        self.port = port
        self.baud = baud
        self.timeout = timeout
        self.buffer = bytes(bufferSize)
        self.bufferLoc = 0
        self.state = self.states.notReceiving
        self.recEvent = recEvent
        threading.Thread(target=self._start).start()

    def write(message):
        """Sends stuff over the serial connection
        Args:
            message (bytes): stuff to send over serial
        """
        self.conn.write(message)#TODO make write header


    def _start(self):
        """Only for use internaly, ran at beinging of thread to start serial connection"""

        with serial.Serial(self.port, self.baud, timeout=self.timeout) as self.conn:
            while self.conn.is_open:
              self._read() 
    
    def _read(self):
        """Only for use internaly, ran in thead to read and process input"""
        char = self.conn.read() #TODO orgizize and process incomeing data
        return 0
