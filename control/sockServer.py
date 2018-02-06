import asyncio
import websockets
import json
from enum import IntEnum, unique

SOCK_PORT = 4242

def start():
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    try:
        coro = websockets.server.serve(handle_conn, host='', port=SOCK_PORT, loop=loop)
        server = loop.run_until_complete(coro)
    except OSError:
        print("close")
    else:
        loop.run_forever()
        server.close()
        loop.run_until_complete(server.wait_closed())
        loop.close()
async def handle_conn(conn, Uri):
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
                data = await self.conn.recv()
            except websockets.exceptions.ConnectionClosed as e:
                self.destory()
                break 
            if not data is None:
                data = json.loads(data)
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

@unique
class dataId(IntEnum):
    """
    Modify this to match the one on the controler
    """
    FRMotor = 0
    FLMotor = 1
    BRMotor = 2
    BLMotor = 3
    ClawServo = 4
    YawAct = 5
    PitchAct = 6
    ExtentionAct = 7
    Error = 8