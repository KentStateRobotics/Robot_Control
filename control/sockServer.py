import asyncio
import websockets
import json
import threading
from protocol import field, action, motor, power

class sockServer:
    '''Starts websocket server, listens for connections, and facilitates automatic reading and writeng from connetions
    Args:
        receiveEvent (function(str)): called when message is received and passed message
        port (int): TCP port to open socket on
    '''
    def __init__(self, port, receiveEvent = None):
        self.port = port
        self.recEvent = []
        loop = None
        if receiveEvent != None:
            self.addReceiveEvent(receiveEvent)
        recT = threading.Thread(target = self.start, args=[port])
        recT.start()
    
    def start(self, port):
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            coro = websockets.server.serve(self.handle_conn, host='', port=port, loop=loop)
            server = loop.run_until_complete(coro)
        except OSError:
            print("close")
        else:
            loop.run_forever()
            server.close()
            loop.run_until_complete(server.wait_closed())
            loop.close()

    def addReceiveEvent(self, event):
        self.recEvent.append(event)

    def rmReceiveEvent(self, event):
        self.recEvent.remove(event)

    async def handle_conn(self, conn, Uri):
        print("URI: " + Uri)
        user = client(conn)
        await user.beginReceiveLoop()

class client:
    def __init__(self, conn):
        self.conn = conn
        self.alive = True
    async def beginReceiveLoop(self):
        while self.alive:
            try:
                message = await self.conn.recv()
            except websockets.exceptions.ConnectionClosed as e:
                self.destory()
                break 
            if message == "":
                print(message)
                data = json.loads(message)
                for evt in self.recEvent:
                    evt(data)
    def send(self, data):
        asyncio.get_event_loop().create_task(self._sendHelper(json.dumps(data)))
    async def _sendHelper(self, data):
        try:
            await self.conn.send(data)
        except websockets.exceptions.ConnectionClosed as e:
            print(e)
            self.destory()
    def destory(self):
        self.alive = False
        self.conn.close()

