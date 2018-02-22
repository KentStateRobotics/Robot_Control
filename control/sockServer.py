import asyncio
import websockets
import json
import control
from protocol import field, action, motor, power

SOCK_PORT = 4242
def start():
    '''
    Starts socket server and listens for connections
    '''
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
                message = await self.conn.recv()
            except websockets.exceptions.ConnectionClosed as e:
                self.destory()
                break 
            if message == "":
                print(message)
                data = json.loads(message)
                res = {}
                if field.action.value in data:
                    if data[field.action.value] == action.requestAll:
                        send(control.getAll())
                    elif data[field.action.value] == action.command:
                        if data[field.motors.value] in data:
                            control.command(data[field.motors.value])
                    elif data[field.action.value] == action.stop:
                        control.stop()
                    elif data[field.action.value] == action.auto:
                        pass
                    elif data[field.action.value] == action.error:
                        pass
                if res != {}:
                    self.send(res)
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

