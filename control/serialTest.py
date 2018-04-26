'''import serial

with serial.Serial('COM4', 9600, timeout=1) as ser:
    while(True):
        input()
        ser.write(b'<kZ1<>')
        while(ser.in_waiting):
            print(ser.read())
'''
import asyncio
import serial_asyncio

class serialOutput(asyncio.Protocol):
    def connection_made(self, transport):
        self.transport = transport
        transport.serial.rts = False
        self.buffer = bytes(100)
        self.bufferLoc = 0
        print("port opened")
        input()
        transport.write(b'<k1Z<>')

    def data_received(self, data):
        for i in range(0, len(data)):
            self.buffer[i + bufferLoc] = data[i]
        self.bufferLoc += len(data)


    def connection_lost(self, exc):
        print('port closed')
        asyncio.get_event_loop().stop()


loop = asyncio.get_event_loop()
coro = serial_asyncio.create_serial_connection(loop, serialOutput, 'COM4', baudrate=9600)
loop.run_until_complete(coro)
loop.run_forever()
loop.close()