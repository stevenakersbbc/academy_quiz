let totalScore = 0;
let questionCount = 0;

function generateElements(data) {
    data.jillsquiz.forEach((element, index) => {
      questionCount++;
      let ques = element.quizquestions[0].question;
      let topic = element.topic;
      let ans = element.quizquestions[0].correct_answer;
      let ans1 = element.quizquestions[0].answers[0];
      let ans2 = element.quizquestions[0].answers[1];
      let ans3 = element.quizquestions[0].answers[2];
      let buttonName = `${topic}-button`

      let mytemplate = `<div>
          <p>Question - ${ques}</p>
          <p>
              <label for="${topic}">Choose an answer:</label>
              <select name="${topic}" id="${topic}">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
              </select>
              <ol>
                  <li>${ans1}</li>
                  <li>${ans2}</li>
                  <li>${ans3}</li>
              </ol>
          </p>
          <button id="${buttonName}" onclick="check('${topic}', ${ans})">Check this answer</button>
          <br/><br/>
        </div>`;

      document.getElementById("mainContent").innerHTML = document.getElementById("mainContent").innerHTML + mytemplate;
      });
  } 


send_post(JSON.stringify({
  title: "view"
}));

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
if (this.readyState == 4 && this.status == 200) {
    data = JSON.parse(this.responseText);
    console.log(data)
    generateElements(data)
}
};
xmlhttp.open("GET", "http://localhost:4000", true);
xmlhttp.send();

function check(thistopic, correctanswer) {
  //Disable user input once the question is answered
  document.getElementById(`${thistopic}-button`).disabled = true;
  document.getElementById(`${thistopic}`).disabled = true;
  let answervalue = document.getElementById(thistopic).value;
  let is_correct = false;
  if (+answervalue == +correctanswer) {
      alert("Correct");
      is_correct = true;
      totalScore++;
  } else {
      alert("Not Correct");
  }

  send_post(JSON.stringify({
    title: "answer",
    topic: thistopic,
    correct: is_correct
  }))
}

function send_post(message_body){
  fetch("http://localhost:4000", {
  method: "POST",
  body: message_body,
  headers: {
    "Content-type": "application/json; charset=UTF-8"
  }
  })
  .then((response) => response.json())
  .then((json) => console.log(json));
}

function submitQuestions() {
  document.getElementById("mainContent").style.display = "none"
  document.getElementById("submit").style.display = "none"

  //Create text with "You scored: x/y"
  let percentageResult = totalScore/questionCount * 100
  let roundedResult = Math.round(percentageResult * 10) / 10
  let resultsHTML = `<div id=resultsText>You scored: ${roundedResult}%</div>`
  document.getElementById("resultsArea").innerHTML += resultsHTML
}