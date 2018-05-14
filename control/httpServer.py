from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer
import threading

class httpServer:
    def __init__(self, port):
        self.port = port
        self.httpS = None
        self.httpT = threading.Thread(target=self.start, args=[port])
        self.httpT.start()

    def start(self, port):
        self.httpS = TCPServer(('', port), SimpleHTTPRequestHandler)
        print("Serving at: " + str(port))
        self.httpS.serve_forever()

    def stop(self):
        if self.httpS != None:
            self.httpS.shutdown()
