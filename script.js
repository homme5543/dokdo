'use strict';

const QUIZ_LENGTH = 10;
const BEST_SCORE_KEY = 'dokdoQuizBestScore';

const startScreen = document.querySelector('#startScreen');
const quizScreen = document.querySelector('#quizScreen');
const resultScreen = document.querySelector('#resultScreen');
const startButton = document.querySelector('#startButton');
const restartButton = document.querySelector('#restartButton');
const nextButton = document.querySelector('#nextButton');
const progressText = document.querySelector('#progressText');
const progressTrack = document.querySelector('.progress-track');
const progressFill = document.querySelector('#progressFill');
const liveScore = document.querySelector('#liveScore');
const questionNumber = document.querySelector('#questionNumber');
const categoryBadge = document.querySelector('#categoryBadge');
const questionText = document.querySelector('#questionText');
const choicesContainer = document.querySelector('#choices');
const feedback = document.querySelector('#feedback');
const feedbackTitle = document.querySelector('#feedbackTitle');
const explanation = document.querySelector('#explanation');
const finalScore = document.querySelector('#finalScore');
const correctCount = document.querySelector('#correctCount');
const wrongCount = document.querySelector('#wrongCount');
const encouragement = document.querySelector('#encouragement');
const bestScore = document.querySelector('#bestScore');
const startBestScore = document.querySelector('#startBestScore');
const newRecord = document.querySelector('#newRecord');
const resultIcon = document.querySelector('#resultIcon');
const scoreRing = document.querySelector('.score-ring');

let quizQuestions = [];
let currentQuestionIndex = 0;
let correctAnswers = 0;
let answerLocked = false;

// 원본 배열을 바꾸지 않고 새 배열의 순서만 섞습니다.
function shuffleArray(items) {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }
  return shuffled;
}

function selectRandomQuestions() {
  return shuffleArray(QUESTIONS).slice(0, QUIZ_LENGTH).map((item) => {
    const choicesWithAnswers = item.choices.map((choice, index) => ({
      text: choice,
      isCorrect: index === item.answer
    }));

    return {
      ...item,
      shuffledChoices: shuffleArray(choicesWithAnswers)
    };
  });
}

function showScreen(screenToShow) {
  [startScreen, quizScreen, resultScreen].forEach((screen) => {
    screen.hidden = screen !== screenToShow;
  });
}

function getBestScore() {
  try {
    const savedScore = Number.parseInt(localStorage.getItem(BEST_SCORE_KEY), 10);
    return Number.isNaN(savedScore) ? 0 : savedScore;
  } catch (error) {
    return 0;
  }
}

function saveBestScore(score) {
  try {
    localStorage.setItem(BEST_SCORE_KEY, String(score));
  } catch (error) {
    // 저장이 제한된 브라우저에서도 퀴즈는 계속 이용할 수 있습니다.
  }
}

function updateStartBestScore() {
  const savedBest = getBestScore();
  startBestScore.textContent = savedBest > 0 ? `🏅 나의 최고 점수: ${savedBest}점` : '';
}

function startQuiz() {
  quizQuestions = selectRandomQuestions();
  currentQuestionIndex = 0;
  correctAnswers = 0;
  answerLocked = false;
  showScreen(quizScreen);
  showQuestion();
}

function showQuestion() {
  const currentQuestion = quizQuestions[currentQuestionIndex];
  const visibleQuestionNumber = currentQuestionIndex + 1;

  answerLocked = false;
  feedback.hidden = true;
  feedback.classList.remove('wrong-feedback');
  nextButton.hidden = true;
  choicesContainer.replaceChildren();

  progressText.textContent = `${visibleQuestionNumber} / ${QUIZ_LENGTH} 문제`;
  progressTrack.setAttribute('aria-valuenow', String(visibleQuestionNumber));
  progressFill.style.width = `${(visibleQuestionNumber / QUIZ_LENGTH) * 100}%`;
  liveScore.textContent = `현재 ${correctAnswers * 10}점`;
  questionNumber.textContent = `문제 ${visibleQuestionNumber}`;
  categoryBadge.textContent = currentQuestion.category;
  questionText.textContent = currentQuestion.question;

  currentQuestion.shuffledChoices.forEach((choice, index) => {
    const button = document.createElement('button');
    const label = document.createElement('span');
    const choiceText = document.createElement('span');

    button.type = 'button';
    button.className = 'choice-button';
    button.dataset.correct = String(choice.isCorrect);
    label.className = 'choice-label';
    label.setAttribute('aria-hidden', 'true');
    label.textContent = String(index + 1);
    choiceText.textContent = choice.text;
    button.append(label, choiceText);
    button.addEventListener('click', () => selectAnswer(button, choice));
    choicesContainer.append(button);
  });
}

function selectAnswer(selectedButton, selectedChoice) {
  if (answerLocked) return;
  answerLocked = true;

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const allButtons = [...choicesContainer.querySelectorAll('.choice-button')];
  const correctChoice = currentQuestion.shuffledChoices.find((choice) => choice.isCorrect);

  allButtons.forEach((button) => {
    button.disabled = true;
    if (button.dataset.correct === 'true') {
      button.classList.add('correct');
      button.setAttribute('aria-label', `${button.textContent}, 정답`);
    }
  });

  if (selectedChoice.isCorrect) {
    correctAnswers += 1;
    feedbackTitle.textContent = '정답이에요! 🎉';
  } else {
    selectedButton.classList.add('wrong');
    selectedButton.setAttribute('aria-label', `${selectedButton.textContent}, 선택한 오답`);
    feedback.classList.add('wrong-feedback');
    feedbackTitle.textContent = `아쉬워요! 정답은 ${correctChoice.text}입니다.`;
  }

  explanation.textContent = currentQuestion.explanation;
  feedback.hidden = false;
  nextButton.textContent = currentQuestionIndex === QUIZ_LENGTH - 1 ? '결과 보기 →' : '다음 문제 →';
  nextButton.hidden = false;
  liveScore.textContent = `현재 ${correctAnswers * 10}점`;
  feedback.focus({ preventScroll: true });
  nextButton.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function nextQuestion() {
  if (!answerLocked) return;

  if (currentQuestionIndex < QUIZ_LENGTH - 1) {
    currentQuestionIndex += 1;
    showQuestion();
    questionText.focus({ preventScroll: true });
  } else {
    showResult();
  }
}

function getEncouragement(score) {
  if (score === 100) return '독도 박사! 정말 대단해요!';
  if (score >= 80) return '독도에 대해 아주 잘 알고 있네요!';
  if (score >= 60) return '잘했어요! 조금만 더 알아보면 독도 박사가 될 수 있어요.';
  return '괜찮아요! 다시 풀면서 독도에 대해 더 알아가요.';
}

function showResult() {
  const score = correctAnswers * 10;
  const previousBest = getBestScore();
  const isNewRecord = score > previousBest;
  const updatedBest = Math.max(score, previousBest);

  if (isNewRecord) saveBestScore(score);

  finalScore.textContent = String(score);
  correctCount.textContent = String(correctAnswers);
  wrongCount.textContent = String(QUIZ_LENGTH - correctAnswers);
  encouragement.textContent = `${QUIZ_LENGTH}문제 중 ${correctAnswers}문제를 맞혔어요! ${getEncouragement(score)}`;
  bestScore.textContent = `🏅 나의 최고 점수: ${updatedBest}점`;
  newRecord.hidden = !isNewRecord;
  resultIcon.textContent = score === 100 ? '🏆' : score >= 60 ? '🌟' : '🌱';
  scoreRing.style.setProperty('--score-angle', `${score * 3.6}deg`);
  showScreen(resultScreen);
  restartButton.focus({ preventScroll: true });
}

function restartQuiz() {
  startQuiz();
}

startButton.addEventListener('click', startQuiz);
nextButton.addEventListener('click', nextQuestion);
restartButton.addEventListener('click', restartQuiz);

updateStartBestScore();
