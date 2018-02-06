import httpServer
import sockServer
import threading

httpT = threading.Thread(target = httpServer.start)
sockT = threading.Thread(target = sockServer.start)
httpT.start()
sockT.start()