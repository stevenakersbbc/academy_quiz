function generateElements(data) {
    data.jillsquiz.forEach((element, index) => {
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
  if (+answervalue == +correctanswer) {
    fetch("http://localhost:4000", {
    method: "POST",
    body: JSON.stringify({
      userId: 1,
      title: "Fix my bugs",
      completed: false
    }),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
  })
    .then((response) => response.json())
    .then((json) => console.log(json));
      alert("Correct");
  } else {
      alert("Not Correct");
  }
}