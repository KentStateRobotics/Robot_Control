import httpServer
import sockServer
import control
import threading

httpT = threading.Thread(target = httpServer.start)
sockT = threading.Thread(target = sockServer.start)
serialT = threading.Thread(target = serialConn.start)
httpT.start()
sockT.start()
serialT.start()
control.start()
