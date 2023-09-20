let totalScore = 0;
let questionCount = 0;
let topicResults = {}

//Used to track correct/incorrect
function incrementTopic(topicName, correct) {
  if (topicName in topicResults) {
    list = topicResults[topicName];
    list[0] += correct ? 1 : 0;
    list[1] += 1
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
  for (topic in topicResults) {
    let result = topicResults[topic];
    topicHTML += `
    ${topic} correct: ${result[0]}/${result[1]}
    <br>
    `;
  }
  return topicHTML;
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
            switch (l) {
              case 0:
                q1 = currentQ.One.Question;
                a1 = currentQ.One.Answer
              case 1:
                q2 = currentQ.Two.Question;
                a2 = currentQ.Two.Answer
              case 2:
                q3 = currentQ.Three.Question;
                a3 = currentQ.Three.Answer
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
        document.getElementById("mainContent").innerHTML += mytemplate;
        incrementTopicTotal(topic);
      }      
    })
  } 


send_post(JSON.stringify({
  title: "view"
}));


var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
if (this.readyState == 4 && this.status == 200) {
    data = JSON.parse(this.responseText);
    generateElements(data)
}
};
xmlhttp.open("GET", "http://localhost:4000?data=questions", true);
xmlhttp.send();


function check(thistopic, questionId, isVideoQ, correctanswer) {
  let is_correct
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
    topic: thistopic,
    correct: is_correct
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
  document.getElementById("mainContent").style.display = "none"
  document.getElementById("submit").style.display = "none"

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
  </div>
  `
  document.getElementById("resultsArea").innerHTML += resultsHTML
  console.log(topicResults)
}