from http.server import HTTPServer, SimpleHTTPRequestHandler

HTTP_PORT = 80

def start():
    serverAddress = ('', HTTP_PORT)
    httpd = HTTPServer(serverAddress, SimpleHTTPRequestHandler)
    httpd.serve_forever()