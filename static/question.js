//The current player's score and number of correct answers.
var correctOption;
//Function to fetch a random question from the database.
let arrayScores = [0,0,0,0,0,0,0,0,0,0];
const arrayProgress = [0,0,0,0,0,0,0,0,0,0];

function fetchQuestion(question_list) {
  var randomQuestion = question_list[Math.floor(Math.random() * question_list.length)];
  question_list = question_list.filter(question => question != randomQuestion)
  
  console.log(randomQuestion.question);
  //Update the question contents.
  updateQuestionContent(randomQuestion);
  //Clear button styling.
  clearButtonStyling();
  //Add event listeners to the answer buttons.
  addButtonsListeners();
  //The current question index.
  var currentQuestionIndex = 0;
  //Random the Next Question button.
  var nextQuestionButton = document.getElementById("next_question");
  //Add a click event listener to the "Next Question" button.
  nextQuestionButton.addEventListener("click", function () {
    const scoreElement = document.getElementById("currentScore").textContent;
    const answersElement = document.getElementById("num_correct_answers").textContent;

    const scoreValue = parseInt(scoreElement);
    const finalCorrectAnswers = parseInt(answersElement);
    arrayScores[currentQuestionIndex] = scoreValue;
      //Increment the current question index.
    currentQuestionIndex++;
      //Check if there are more questions available.
    if (currentQuestionIndex < 11) {
      if (currentQuestionIndex == 10) {
        document.getElementById("next_question").textContent = "Finish Game";
      }
          //Random the next question from the question_List array.
          var randomQuestion = question_list[Math.floor(Math.random() * question_list.length)];
          //Update the question and options in the HTML elements.
          question_list = question_list.filter(question => question != randomQuestion)
          updateQuestionContent(randomQuestion) 
          console.log("correct ans = " + correctOption);
          console.log("question num " + currentQuestionIndex);
          //Clear buttons styling.
          clearButtonStyling();

          //Update the progress bar to indicate the current question.
          updateProgressBar(currentQuestionIndex);
          updateButtons();
      } else {

        fetchPost({score: scoreValue, answers: finalCorrectAnswers, arrayscores: arrayScores}).then((response) => {
            console.log('here')
            console.log(response)
            window.location.href = response.url;
        })
        console.log("move to goal page-->display graph");

     }
  });

}


//Add event listeners to the answer buttons.
const updateButtons = () => {
  for(let i = 1; i <= 4; i++)
  {
    removeButtonsListners(`option${i}`);
  }
}
const removeButtonsListners = (option) => {
  console.log('called remove')
  document.getElementById(option).removeEventListener("click", addEventListener);
}



function addButtonsListeners() {  
  console.log('called add')
  document.getElementById("option1").addEventListener("click", function () {
    checkAnswer(1);
  });
  document.getElementById("option2").addEventListener("click", function () {
    checkAnswer(2);
  });
  document.getElementById("option3").addEventListener("click", function () {
    checkAnswer(3);
  });
  document.getElementById("option4").addEventListener("click", function () {
    checkAnswer(4);
  });
  document.getElementById("answer_button").addEventListener("click", function () {
    showPopup(correctOption);
  });
}

//Update the question and options in the HTML elements.
function updateQuestionContent(randomQuestion) {

  document.getElementById("question").textContent = randomQuestion.question;
  document.getElementById("option1").textContent = randomQuestion.option1;
  document.getElementById("option2").textContent = randomQuestion.option2;
  document.getElementById("option3").textContent = randomQuestion.option3;
  document.getElementById("option4").textContent = randomQuestion.option4;
  correctOption = randomQuestion.correct;
}

// Function to check the selected answer and update the styling and progress bar
function checkAnswer(optionNum) {

  //Disable all answer buttons to prevent further selection
  var buttons = document.getElementsByClassName("options");
  for (var i = 0; i < buttons.length; i++) {
    document.getElementById("option" + (i + 1).toString()).disabled = true;
    
  }

  var selectedOption = document.getElementById("option" +  optionNum.toString()).textContent;
  document.querySelector('.anwserSection').style.display = "flex";
  document.querySelector('.showButtons').style.display = 'block';
  // Update the styling and progress bar based on the selected answer.
  if (selectedOption === correctOption) {
    document.getElementById("option" +  optionNum.toString()).style.backgroundColor = "green";
    document.getElementById("option" +  optionNum.toString()).style.color = "white";
    document.getElementById("answerStatus").textContent = "Good Job! +2";
    document.getElementById("next_question").style.display = "inline-block";
    document.getElementById("answer_button").style.display = "none";
    var scoreValue = document.getElementById("currentScore").textContent;
    var score = parseInt(scoreValue);
    var quesNum = document.getElementById("num_correct_answers").textContent;
    var correctQues = parseInt(quesNum);
    document.getElementById("currentScore").textContent = score+2;

    document.getElementById("num_correct_answers").textContent =correctQues+1;
    updateProgressBar();
  
  } else {
    document.getElementById("option" + optionNum.toString()).style.backgroundColor = "red";
    document.getElementById("option" +  optionNum.toString()).style.color = "white";
    document.getElementById("answerStatus").textContent = "Wrong answer...";
    document.getElementById("next_question").style.display = "inline-block"; 
    document.getElementById("answer_button").style.display = "inline-block";
    updateProgressBar();
  }
}

//Function to clear the styling of the answer buttons.
function clearButtonStyling() {
  var buttons = document.getElementsByClassName("options");
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].style.backgroundColor = "";
    document.getElementById("option" + (i + 1).toString()).style.color = "black";
    document.getElementById("option" + (i+1).toString()).style.backgroundColor = "#33A0c1";
    //document.getElementById("option" + (i + 1).toString()).disabled = false;
    buttons[i].getElementsByTagName("button")[0].disabled = false;
  }
  document.getElementById("answerStatus").textContent = "";
  document.getElementById("answer_button").style.display = "none";
  document.getElementById("next_question").style.display = "none";
  document.querySelector('.showButtons').style.display = 'none';
  document.querySelector('.anwserSection').style.display = 'none';
  
}


//Update progress bar.
function updateProgressBar(currentQuestionIndex) {
  var steps = document.getElementsByClassName("step");
  for (var i = 0; i <= currentQuestionIndex; i++) {
    steps[i].classList.add("active");
  }  
}

//Show pop up with the correct answer.
function showPopup(CorrectAnswer) {
  document.getElementById("answer-text").textContent = CorrectAnswer;
  document.getElementById("popup").style.display = "block";
}

//Hide pop up.
function closePopup() {
  document.getElementById("popup").style.display = "none";
}

const fetchPost = async(data) => {
  const newUrl = window.location.protocol + "//" + window.location.host + "/" + window.location.pathname + window.location.search 
  console.log(newUrl);
  const response = await fetch(newUrl, {
    method: "POST",
    redirect: 'follow',
    headers: {
      "Content-Type": "application/json",
    },
    body:JSON.stringify(data)
  });
  return response.json();
}






