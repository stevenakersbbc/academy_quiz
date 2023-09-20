let totalScore = 0;
let questionCount = 0;

function generateElements(data) {    
    data.quiz.forEach((category, index) => {
      let categoryName = Object.keys(category)[0];
      let questions = data.quiz[index][categoryName]
      for (let i = 0; i < questions.length; i++) {
        questionCount++;
        //Loops through each questions
        let currentQ = questions[i];
        let ques = currentQ.Question;
        let topic = categoryName;
        let ans = currentQ.CorrectAnswer;
        let ans1 = currentQ.Options.a;
        let ans2 = currentQ.Options.b;
        let ans3 = currentQ.Options.c;
        let ans4 = currentQ.Options.d;

        let questionName = `${topic}-${i}`
        let buttonName = `${questionName}-button`;

        let mytemplate = `<div>
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
          <button id="${buttonName}" onclick="check('${topic}', ${i}, ${ans})">Check this answer</button>
          <br/><br/>
        </div>`;

        document.getElementById("mainContent").innerHTML += mytemplate;
      }      
    })
  } 

var xmlhttp = new XMLHttpRequest();
xmlhttp.onreadystatechange = function() {
if (this.readyState == 4 && this.status == 200) {
    data = JSON.parse(this.responseText);
    generateElements(data)
}
};
xmlhttp.open("GET", "http://localhost:4000", true);
xmlhttp.send();

function check(thistopic, questionId, correctanswer) {
  //Disable user input once the question is answered
  let buttonName = `${thistopic}-${questionId}`;
  document.getElementById(`${buttonName}-button`).disabled = true;
    document.getElementById(buttonName).disabled = true;
  let answervalue = document.getElementById(buttonName).value;
  
  if (+answervalue == +correctanswer) {
      alert("Correct");
      totalScore++;
  } else {
    alert("Not Correct");
  }
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