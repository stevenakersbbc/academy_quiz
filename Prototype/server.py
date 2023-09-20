import json
from http.server import HTTPServer, BaseHTTPRequestHandler


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(jsonData, ensure_ascii=True).encode('utf-8'))

    #Add a post method to allow metrics sending back

    def do_POST(self):
        post_len = int(self.headers.get('Content-Length'))
        post_body = self.rfile.read(post_len)

        telemetry_post = json.loads(post_body)
        print(telemetry_post)



jsonData = json.loads(open('Prototype/myquizdata.json').read())
telemetry = json.loads(open('Prototype/telemetry.json').read())
httpd = HTTPServer(('localhost', 4000), SimpleHTTPRequestHandler)
httpd.serve_forever()
