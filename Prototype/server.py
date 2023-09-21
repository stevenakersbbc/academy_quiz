import json
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

def write_time_info(json_location, name, now) :
    if (name not in json_location):
        json_location[name] = {}

    for day in ["all_days", now.tm_wday]:
        if (day not in json_location[name]):
            json_location[name][day] = {}
        for hour in ["all_hours", now.tm_hour]:
            if (hour not in json_location[name][day]):
                json_location[name][day][hour] = {}
            for minute in ["all_minutes", now.tm_min]:
                if (minute not in json_location[name][day][hour]):
                    json_location[name][day][hour][minute]= 0
                    
                json_location[name][day][hour][minute] += 1


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

    write_time_info(telemetry["topics"][topic], "activity_over_time", now)



class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()

        URLsplit = self.path.split("?")[1:]
        print(URLsplit)
        if len(URLsplit) >= 1:
            queries = URLsplit[0]
            if queries == "data=questions":
                self.wfile.write(json.dumps(question_data, ensure_ascii=True).encode('utf-8'))
            if queries == "data=leaderboard":
                self.wfile.write(json.dumps(leaderboard, ensure_ascii=True).encode('utf-8'))


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


        #if post_body["title"] == "data_request":
                #self.wfile.write(json.dumps(jsonData, ensure_ascii=True).encode('utf-8'))
                #return
        if post_body["title"] == "view":
            if post_body["type"] == "page":
                if ("page_views" not in telemetry):
                    telemetry["page_views"] = 0
                telemetry["page_views"] += 1
                
                if ("page_activity_time_data" not in telemetry):
                    telemetry["page_activity_time_data"] = {}

                write_time_info(telemetry, "page_activity_time_data", time.gmtime())

            else:
                topic = post_body["type"]
                if ("topics" not in telemetry):
                    telemetry["topics"] = {}
                if (topic not in telemetry["topics"]):
                    telemetry["topics"][topic] = {}
                if ("topic_views" not in telemetry["topics"][topic]):
                    telemetry["page_views"] = 0

                write_time_info(telemetry["topics"][topic], "topic_views", time.gmtime())


        elif post_body["title"] == "answer":
            topic = post_body["topic"]
            correct = post_body["correct"]
            now = time.gmtime()

            handle_answer_message("all_topics", correct, now)
            handle_answer_message(topic, correct, now)
        elif post_body["title"] == "new_submission":
            nickname = post_body["nickname"]
            score = post_body["score"]
            topic = post_body["topic"]

            if (topic not in leaderboard):
                leaderboard[topic] = []

            if len(leaderboard[topic]) == 0:
                leaderboard[topic].append(
                    {
                        "name": nickname,
                        "score": score,
                    }
                )
                json.dump(leaderboard, open("leaderboard.json", "w"))
                return

            name_already_exists = -1

            for id in range(len(leaderboard[topic])):
                if leaderboard[topic][id]["name"] == nickname:
                    if leaderboard[topic][id]["score"] < score:
                        name_already_exists = id
                    else: 
                        json.dump(leaderboard, open("leaderboard.json", "w"))
                        return

            if name_already_exists != -1:
                leaderboard[topic].pop(name_already_exists)
                
            if len(leaderboard[topic]) == 0:
                leaderboard[topic].append(
                    {
                        "name": nickname,
                        "score": score,
                    }
                )
                json.dump(leaderboard, open("leaderboard.json", "w"))
                return

            leaderboard_position = -1
            current_position = 0

            for person in leaderboard[topic]:
                if leaderboard_position == -1:
                    if person["score"] == score:
                        if person["name"] > nickname:
                            leaderboard_position = current_position 
                        else:
                            leaderboard_position = current_position + 1
                    elif person["score"] < score:
                        leaderboard_position = current_position
                            
                current_position += 1
            
            if leaderboard_position == -1 and len(leaderboard[topic]):
                leaderboard[topic].append({
                    "name": nickname,
                    "score": score
                })


            if leaderboard_position != -1:
                leaderboard[topic].insert(leaderboard_position, {
                    "name": nickname,
                    "score": score
                })

            while len(leaderboard[topic]) > 10:
                leaderboard[topic].pop(10)

            json.dump(leaderboard, open("leaderboard.json", "w"))


        else:
            if ("invalid_requests" not in telemetry):
                telemetry["invalid_requests"] = 0
            telemetry["invalid_requests"] += 1

        print (post_body["title"])
            
        json.dump(telemetry, open("telemetry.json", "w"))
        self.wfile.write("{\"recieved\":true}".encode('utf-8'))

question_data = json.loads(open('questions.json').read())
leaderboard =  json.loads(open('leaderboard.json').read())
telemetry = json.loads(open('telemetry.json').read())
httpd = HTTPServer(('localhost', 4000), SimpleHTTPRequestHandler)
httpd.serve_forever()
