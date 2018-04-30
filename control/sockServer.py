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
        self.recEvent = receiveEvent
        self.users = []
        loop = None
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

    def send(self, data):
        for user in self.users:
            user.send(data)

    async def handle_conn(self, conn, Uri):
        print("URI: " + Uri)
        user = client(conn, self.recEvent, self)
        self.users.append(user)
        await user.beginReceiveLoop()

class client:
    def __init__(self, conn, recEvent, sockServ):
        self.conn = conn
        self.alive = True
        self.recEvent = recEvent
        self.sockServ = sockServ
    async def beginReceiveLoop(self):
        while self.alive:
            try:
                message = await self.conn.recv()
            except websockets.exceptions.ConnectionClosed as e:
                self.destory()
                break 
            if message != "":
                print(message)
                try:
                    data = json.loads(message)
                    self.recEvent(data)
                except ValueError as e:
                    print("JSON LOAD ERROR: " + e)
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
        self.sockServ.users.remove(self)
        self.conn.close()

