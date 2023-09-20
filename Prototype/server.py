import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

def handle_answer_message(topic, correct, now):
    #Make sure that the relevant keys exist
    if ("topics" not in telemetry):
        telemetry["topics"] = {}
    if (topic not in telemetry["topics"]):
        telemetry["topics"][topic] = {}
    if ("answers" not in telemetry["topics"][topic]):
        telemetry["topics"][topic]["answers"] = 0
    if ("correct_answers" not in telemetry["topics"][topic]):
        telemetry["topics"][topic]["correct_answers"] = 0
    if ("correct_answer_rate" not in telemetry["topics"][topic]):
        telemetry["topics"][topic]["correct_answer_rate"] = 0


        
    telemetry["topics"][topic]["answers"] += 1
    if correct:
        telemetry["topics"][topic]["correct_answers"] += 1
        
    telemetry["topics"][topic]["correct_answer_rate"] = 100.0 * telemetry["topics"][topic]["correct_answers"] / telemetry["topics"][topic]["answers"]

    if ("answer_times" not in telemetry["topics"][topic]):
        telemetry["topics"][topic]["answer_times"] = {}
    if ("all_days" not in telemetry["topics"][topic]["answer_times"]):
        telemetry["topics"][topic]["answer_times"]["all_days"] = {}
    if ("all_hours" not in telemetry["topics"][topic]["answer_times"]["all_days"]):
        telemetry["topics"][topic]["answer_times"]["all_days"]["all_hours"] = {}
    if ("all_minutes" not in telemetry["topics"][topic]["answer_times"]["all_days"]["all_hours"]):
        telemetry["topics"][topic]["answer_times"]["all_days"]["all_hours"]["all_minutes"]= 0
        
    telemetry["topics"][topic]["answer_times"]["all_days"]["all_hours"]["all_minutes"] += 1

    if (now.tm_min not in telemetry["topics"][topic]["answer_times"]["all_days"]["all_hours"]):
        telemetry["topics"][topic]["answer_times"]["all_days"]["all_hours"][now.tm_min] = 0

    telemetry["topics"][topic]["answer_times"]["all_days"]["all_hours"][now.tm_min] += 1


    if (now.tm_hour not in telemetry["topics"][topic]["answer_times"]["all_days"]):
        telemetry["topics"][topic]["answer_times"]["all_days"][now.tm_hour] = {}
    if ("all_minutes" not in telemetry["topics"][topic]["answer_times"]["all_days"][now.tm_hour]):
        telemetry["topics"][topic]["answer_times"]["all_days"][now.tm_hour]["all_minutes"] = 0

    telemetry["topics"][topic]["answer_times"]["all_days"][now.tm_hour]["all_minutes"] += 1

    
    if (now.tm_min not in telemetry["topics"][topic]["answer_times"]["all_days"][now.tm_hour]):
        telemetry["topics"][topic]["answer_times"]["all_days"][now.tm_hour][now.tm_min] = 0

    telemetry["topics"][topic]["answer_times"]["all_days"][now.tm_hour][now.tm_min] += 1


    if (now.tm_wday not in telemetry["topics"][topic]["answer_times"]):
        telemetry["topics"][topic]["answer_times"][now.tm_wday] = {}
    if ("all_hours" not in telemetry["topics"][topic]["answer_times"][now.tm_wday]):
        telemetry["topics"][topic]["answer_times"][now.tm_wday]["all_hours"] = {}
    if ("all_minutes" not in telemetry["topics"][topic]["answer_times"][now.tm_wday]["all_hours"]):
        telemetry["topics"][topic]["answer_times"][now.tm_wday]["all_hours"]["all_minutes"]= 0
        
    telemetry["topics"][topic]["answer_times"][now.tm_wday]["all_hours"]["all_minutes"] += 1


    if (now.tm_min not in telemetry["topics"][topic]["answer_times"][now.tm_wday]["all_hours"]):
        telemetry["topics"][topic]["answer_times"][now.tm_wday]["all_hours"][now.tm_min] = 0

    telemetry["topics"][topic]["answer_times"][now.tm_wday]["all_hours"][now.tm_min] += 1


    if (now.tm_hour not in telemetry["topics"][topic]["answer_times"][now.tm_wday]):
        telemetry["topics"][topic]["answer_times"][now.tm_wday][now.tm_hour] = {}
    if ("all_minutes" not in telemetry["topics"][topic]["answer_times"][now.tm_wday][now.tm_hour]):
        telemetry["topics"][topic]["answer_times"][now.tm_wday][now.tm_hour]["all_minutes"] = 0

    telemetry["topics"][topic]["answer_times"][now.tm_wday][now.tm_hour]["all_minutes"] += 1

    
    if (now.tm_min not in telemetry["topics"][topic]["answer_times"][now.tm_wday][now.tm_hour]):
        telemetry["topics"][topic]["answer_times"][now.tm_wday][now.tm_hour][now.tm_min] = 0

    telemetry["topics"][topic]["answer_times"][now.tm_wday][now.tm_hour][now.tm_min] += 1
    
    

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
        self.send_response(200, "ok")
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        post_len = int(self.headers.get('Content-Length'))
        post_body = json.loads(self.rfile.read(post_len))

        
        if post_body["title"] == "view":
            if ("page_views" not in telemetry):
                telemetry["page_views"] = 0
            telemetry["page_views"] += 1
        elif post_body["title"] == "answer":
            topic = post_body["topic"]
            correct = post_body["correct"]
            now = time.gmtime()

            handle_answer_message("all_topics", correct, now)
            handle_answer_message(topic, correct, now)
        else:
            if ("invalid_requests" not in telemetry):
                telemetry["invalid_requests"] = 0
            telemetry["invalid_requests"] += 1

            
        json.dump(telemetry, open("telemetry.json", "w"))
        self.wfile.write("{\"recieved\":true}".encode('utf-8'))

jsonData = json.loads(open('questions.json').read())
print(jsonData)
telemetry = json.loads(open('telemetry.json').read())
httpd = HTTPServer(('localhost', 4000), SimpleHTTPRequestHandler)
httpd.serve_forever()
