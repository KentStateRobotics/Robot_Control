from http.server import HTTPServer, BaseHTTPRequestHandler
import socket
import sockServer

HTTP_PORT = 80
JS_CLIENT = "client.js"

def start():
    serverAddress = ('', HTTP_PORT)
    httpd = HTTPServer(serverAddress, HTTPHandler)
    httpd.serve_forever()

class HTTPHandler(BaseHTTPRequestHandler):
    content = "remote/"
    mimes = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "html": "text/html",
        "htm": "text/html",
        "txt": "text/plain",
        "png": "image/png",
        "gif": "image/gif",
        "css": "text/css",
        "js": "application/javascript",
        "json": "application/json",
        "mp4": "video/mp4",
        "ico": "image/x-icon"}
    def do_HEAD(self):
        self.send_response(200)
        self.send_header("Content-type", "text/html")
        self.end_headers()
    def do_GET(self):
        self.statusCode = 200
        self.mime = "text/html"
        body = bytes(self.route(), "utf8")
        self.send_response(self.statusCode)
        self.send_header("Content-type", self.mime)
        self.end_headers()
        self.wfile.write(body)
    def log_message(self, format, *args):
        return   
    def route(self):
        path = self.path.split('/')
        if self.path == "/" or path[1] == "home":
            return self.readFile("index.html")
        else:
            try:
                fContent = self.readFile(path[1])
                self.mime = self.mimes[path[1][path[1].rindex(".") + 1:]]
                return fContent
            except IOError:
                self.statusCode = 404
                return "" 
    def readFile(self, fPath):
        with open(self.content + fPath) as f:
            fContent = f.read()
            if fPath == JS_CLIENT:
                localIp = (([ip for ip in socket.gethostbyname_ex(socket.gethostname())[2] if not ip.startswith("127.")] or [[(s.connect(("8.8.8.8", 53)), s.getsockname()[0], s.close()) for s in [socket.socket(socket.AF_INET, socket.SOCK_DGRAM)]][0][1]]) + [""])[0]
                fContent = fContent.format(ip = localIp + ":" + str(sockServer.SOCK_PORT))
            f.close()
            return fContent


    