from http.server import SimpleHTTPRequestHandler
from socketserver import TCPServer 

HTTP_PORT = 80

def start():
    print("HTTP")
    with TCPServer(('', HTTP_PORT), SimpleHTTPRequestHandler) as httpd:
        print("Serving at: " + str(HTTP_PORT))
        httpd.serve_forever()