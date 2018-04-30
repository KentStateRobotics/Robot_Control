from http.server import HTTPServer, SimpleHTTPRequestHandler
import threading

class httpServer:
    def __init__(self, port):
        self.port = port
        self.httpS = None
        self.httpT = threading.Thread(target=self.start, args=[port])
        self.httpT.start()

    def start(self, port):
        with HTTPServer(('', port), SimpleHTTPRequestHandler) as self.httpS:
            print("Serving at: " + str(port))
            self.httpS.serve_forever()

    def stop(self):
        if self.httpS != None:
            self.httpS.shutdown()
