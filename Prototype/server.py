import json
from http.server import HTTPServer, BaseHTTPRequestHandler


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(jsonData, ensure_ascii=True).encode('utf-8'))

    #Add a post method to allow metrics sending back
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header("Access-Control-Allow-Headers", "X-Requested-With")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
    
    def do_POST(self):
        post_len = int(self.headers.get('Content-Length'))
        post_body = json.loads(self.rfile.read(post_len))

        
        if post_body["title"] == "view":
            if ("page_views" not in telemetry):
                telemetry["page_views"] = 0
            telemetry["page_views"] += 1
        else:
            if ("invalid_requests" not in telemetry):
                telemetry["invalid_requests" not in telemetry] = 0
            telemetry["invalid_requests"] += 1

        json.dump(telemetry, open("telemetry.json", "w"))

jsonData = json.loads(open('myquizdata.json').read())
print(jsonData)
telemetry = json.loads(open('telemetry.json').read())
httpd = HTTPServer(('localhost', 4000), SimpleHTTPRequestHandler)
httpd.serve_forever()
