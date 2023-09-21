let totalScore = 0;
let questionCount = 0;
let topicResults = {}
let topics = []
let currentTopic = "invalid";

//Used to track correct/incorrect
function incrementTopic(topicName, correct) {
  if (topicName in topicResults) {
    list = topicResults[topicName];
    list[0] += correct ? 1 : 0;
  }
}
//Used to track total topic question count
function incrementTopicTotal(topicName) {
  if (topicName in topicResults) {
    list = topicResults[topicName];
    list[1] += 1
  } else {
    topicResults[topicName] = [0, 1]
  }
}

function topicBreakdown() {
  let topicHTML = "";
  for (let topic in topicResults) {
    let result = topicResults[topic];
    topicHTML += `
    ${topic} correct: ${result[0]}/${result[1]}
    <br>
    `;
  }
  return topicHTML;
}

function typing() {
  let name = document.getElementById("name").value;
  let submitButton = document.getElementById("submit");
  submitButton.innerHTML = "Submit";
  if (!name) {
    submitButton.innerHTML += " Anonymously";
  }
}

function generateElements(data) {  
  data.quiz.forEach((category, index) => {
    let categoryName = Object.keys(category)[0];
    let questions = data.quiz[index][categoryName]
    for (let i = 0; i < questions.length; i++) {
      //Loops through each questions

      //detect if video question and load different

      
      let currentQ = questions[i];
      let topic = categoryName;
      let questionName = `${topic}-${i}`
      let buttonName = `${questionName}-button`;

      let mytemplate = "";

      let link = currentQ.Link;
      if (link) {
        questionCount += 4;
        //Video question
        //Load all the questions and answers
        let q1,q2,q3,q4;
        let a1,a2,a3,a4;
        for (let l = 0; l < 4; l++) {
          incrementTopicTotal(topic);
          switch (l) {
            case 0:
              q1 = currentQ.One.Question;
              a1 = currentQ.One.Answer;
            case 1:
              q2 = currentQ.Two.Question;
              a2 = currentQ.Two.Answer;
            case 2:
              q3 = currentQ.Three.Question;
              a3 = currentQ.Three.Answer;
            case 3:
              q4 = currentQ.Four.Question;
              a4 = currentQ.Four.Answer;
          }
        }

        //questionName and buttonName get disabled after answer
        mytemplate = `<div>
        <p>Video Question</p>
        <iframe id="ytplayer" type="text/html" width="640" height="390" src=${link} frameborder="0"/></iframe>
        <ol>
            <li>${q1} <select id="${questionName}-0"><option value="false">False</option><option value="true">True</option></select> </li>
            <li>${q2} <select id="${questionName}-1"><option value="false">False</option><option value="true">True</option></select> </li> 
            <li>${q3} <select id="${questionName}-2"><option value="false">False</option><option value="true">True</option></select> </li>
            <li>${q4} <select id="${questionName}-3"><option value="false">False</option><option value="true">True</option></select> </li>
        </ol>
        <button id="${buttonName}" onclick="check('${topic}', ${i}, true, [${a1},${a2},${a3},${a4}])">Check these answer</button>
        <br/><br/>
        </div>`;
        
      } else {
        questionCount++;
        incrementTopicTotal(topic);
        //Multiple choice question
        let ques = currentQ.Question;
        let ans = currentQ.CorrectAnswer;
        let ans1 = currentQ.Options.a;
        let ans2 = currentQ.Options.b;
        let ans3 = currentQ.Options.c;
        let ans4 = currentQ.Options.d;

        mytemplate = `<div>
          <p>Question - ${ques}</p>
          <p>
              <label for="${questionName}">Choose an answer:</label>
              <select name="${topic}" id="${questionName}">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
              </select>
              <ol>
                  <li>${ans1}</li>
                  <li>${ans2}</li>
                  <li>${ans3}</li>
                  <li>${ans4}</li>
              </ol>
          </p>
          <button id="${buttonName}" onclick="check('${topic}', ${i}, false, ${ans})">Check this answer</button>
          <br/><br/>
        </div>`;
      }

      let sectionName = topic + "Content";
      let topicSection = document.getElementById(sectionName);
      if (topicSection) {
        //Append to the correct topic section
        topicSection.innerHTML += mytemplate;
      } else {
        topics.push(sectionName); //Store the section name for nav (hiding / showing)
        createSectionButton(sectionName, topic);

        //Create the correct topic section and its section button
        document.getElementById("mainContent").innerHTML += `
        <div id="${sectionName}">

        </div>
        `
        document.getElementById(sectionName).innerHTML += mytemplate;
      }
    }      
  })
} 

function createSectionButton(sectionName, displayName) {
  document.getElementById("nav").innerHTML += `
  <button onclick="navigate('${sectionName}')">${displayName}</button>
  `
}

let firstRun = false;
function navigate(sectionName) {
  if (!firstRun) {
    document.getElementById("welcomeText").remove();
    showElement("mainContent", true);
    showElement("resultsArea", true);
    firstRun = true;
  }

  for (let i = 0; i < topics.length; i++) {
    let topic = topics[i];
    if (topic== sectionName) {
      showElement(topic, true);
      send_post(JSON.stringify({
        title: "view",
        type: topic
      }));
      currentTopic = topic;
    } else {
      showElement(topic, false);
    }
  }
}

function showElement(id, shouldDisplay) {
  document.getElementById(id).style.display = shouldDisplay ? "block" : "none";
}


function check(thistopic, questionId, isVideoQ, correctanswer) {
  let is_correct = false;
  let questionName = `${thistopic}-${questionId}`;
  document.getElementById(`${questionName}-button`).disabled = true;
  if (isVideoQ) {
    //Disable each true/false box
    let resultString = "" //Append correct / incorrect and add newlines, this will be returned in an alert
    for (let i = 0; i < 4; i++) {
      let answerBox = `${questionName}-${i}`;
      document.getElementById(answerBox).disabled = true;
      //Check each true/false box and append to the string the result, this will be printed in one after the loop
      let answervalue = document.getElementById(answerBox).value;
      if ((answervalue === "true") == correctanswer[i]) {
        resultString += "Correct\n";
        totalScore++;
        is_correct = true;
        incrementTopic(thistopic, true);
      } else {
        resultString += "Incorrect\n";
        is_correct = false;
        incrementTopic(thistopic, false);
      }
    }
    alert(resultString);
  } else {
    //Disable the answer box
    document.getElementById(questionName).disabled = true;
    let answervalue = document.getElementById(questionName).value;
    let is_correct = false;
    if (+answervalue == +correctanswer) {
        alert("Correct");
        is_correct = true;
        totalScore++;
        incrementTopic(thistopic, true);
    } else {
        alert("Not Correct");
        incrementTopic(thistopic, false);
    }
  }
  
  send_post(JSON.stringify({
    title: "answer",
    correct: is_correct,
    topic: thistopic,
  }))
}

function send_post(message_body){
  let answer_as_json;
  fetch("http://localhost:4000", {
  method: "POST",
  body: message_body,
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }
  })
  .then((response) => response.json())
  .then((json) => {
    //console.log(json)
    answer_as_json = json }
    );
  return answer_as_json;
}

function submitQuestions() {
  //Hide the questions and the submit button
  showElement("mainContent", false);
  showElement("nav", false);
  showElement("submit", false);

  //Create text with "You scored: x% total!"
  //And create the breakdown of results per topic
  let percentageResult = totalScore/questionCount * 100
  let roundedResult = Math.round(percentageResult * 10) / 10
  let resultsHTML = `
  <div id=resultsText>
    You scored: ${roundedResult}% total!
    <hr>
    Total correct: ${totalScore}/${questionCount}
    <br>
    ${topicBreakdown()}
    <br>
    <h3>Leaderboard</h3>
    <div id="table-container" class="leaderboard"></div> 
    <script src="leaderboard.js"></script>
  </div>
  `
  document.getElementById("resultsArea").innerHTML += resultsHTML
  submitLeaderboardAttempt(currentTopic, "TEST TEST, THIS IS A TEST", totalScore)
  loadLeaderboard();
}


function submitLeaderboardAttempt(topic, nickname, score){
  console.log("submitting")
  send_post(JSON.stringify({
    title: "new_submission",
    topic: topic,
    nickname: nickname,
    score: score
  }))
}

function getLeaderboard() {
  var xmlhttp1 = new XMLHttpRequest();
  xmlhttp1.onreadystatechange = function() {
  if (this.readyState == 4 && this.status == 200) {
      //data2 = JSON.parse(this.responseText);
      console.log(this.responseText);
      return JSON.parse(this.responseText)
  }
  };
  xmlhttp1.open("GET", "http://localhost:4000?data=leaderboard", true);
  xmlhttp1.send();
}

function loadLeaderboard() {
  console.log("TEST")

  //Data storing nicknames and results, this will be changed for a network request
  const data = {
    "history": [
        { "name": "team groovy", "score": 20 },
        { "name": "team ungroovy", "score": 18 },
        { "name": "imagine it continues like this for 10 people in the list", "score": 18 },
        { "name": "imagine it continues like this for 10 people in the list", "score": 18 }
    ]
  };

  var tableContainer = document.getElementById("table-container"); // Reference for the table
  var table = document.createElement("table"); // Create HTML table element

  // Add the first row
  var topHeaderRow = table.insertRow(0);
  var headerCell1 = topHeaderRow.insertCell(0);
  var headerCell2 = topHeaderRow.insertCell(1);

  headerCell1.innerHTML = "<b>Nickname</b>"; //Add the headers
  headerCell2.innerHTML = "<b>Score</b>";

  // Loop and populate table with data
  for (var j = 0; j < data.history.length; j++) {
    var rowData = data.history[j];
    var row = table.insertRow(j + 1); // start at 1 and incriment
    var cell1 = row.insertCell(0);
    var cell2 = row.insertCell(1);

    cell1.innerHTML = rowData.name; //insert words
    cell2.innerHTML = rowData.score;
  }
  // update table
  tableContainer.appendChild(table);
}

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
if (this.readyState == 4 && this.status == 200) {
    data = JSON.parse(this.responseText);
    generateElements(data)
}
};
xmlhttp.open("GET", "http://localhost:4000?data=questions", true);
xmlhttp.send();

send_post(JSON.stringify({
  title: "view",
  type: "page"
}));