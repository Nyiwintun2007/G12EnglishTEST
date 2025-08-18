// Global Variables
let currentUnit = null;
let currentSection = "vocabulary";
let currentIndex = 0;
let isFlipped = false;

// Section configurations
const sections = {
  vocabulary: {
    name: "Vocabulary",
    type: "flashcard",
    dataKey: "vocabulary",
  },
  shortQuestions: {
    name: "Short Questions",
    type: "flashcard",
    dataKey: "shortQuestions",
  },
  initialLetters: {
    name: "Initial Letters",
    type: "quiz",
    dataKey: "initialLetters",
  },
  multipleChoice: {
    name: "Multiple Choice",
    type: "quiz",
    dataKey: "multipleChoice",
  },
  grammar: {
    name: "Grammar",
    type: "flashcard",
    dataKey: "grammar",
  },
};

// DOM Elements
const unitSelect = document.getElementById("unit-select");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

// Section buttons
const vocabularyBtn = document.getElementById("vocabulary-section");
const shortQuestionsBtn = document.getElementById("short-questions-section");
const initialLettersBtn = document.getElementById("initial-letters-section");
const multipleChoiceBtn = document.getElementById("multiple-choice-section");
const grammarBtn = document.getElementById("grammar-section");

// Screens
const welcomeScreen = document.getElementById("welcome-screen");
const vocabularyScreen = document.getElementById("vocabulary-screen");
const shortQuestionsScreen = document.getElementById("short-questions-screen");
const initialLettersScreen = document.getElementById("initial-letters-screen");
const multipleChoiceScreen = document.getElementById("multiple-choice-screen");
const grammarScreen = document.getElementById("grammar-screen");

// Initialize Application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  setupEventListeners();
});

function initializeApp() {
  // Populate unit selector
  populateUnitSelector();

  // Show welcome screen by default
  showScreen("welcome");

  // Set default section
  setSection("vocabulary");
}

function populateUnitSelector() {
  // Clear existing options except the first one
  unitSelect.innerHTML = '<option value="">Choose a unit...</option>';

  // Add units from data
  if (typeof unitsData !== "undefined") {
    Object.keys(unitsData).forEach((unitKey) => {
      const option = document.createElement("option");
      option.value = unitKey;
      option.textContent = unitsData[unitKey].title;
      unitSelect.appendChild(option);
    });
  }
}

function setupEventListeners() {
  // Unit selection
  unitSelect.addEventListener("change", handleUnitChange);

  // Section selection
  vocabularyBtn.addEventListener("click", () => setSection("vocabulary"));
  shortQuestionsBtn.addEventListener("click", () =>
    setSection("shortQuestions")
  );
  initialLettersBtn.addEventListener("click", () =>
    setSection("initialLetters")
  );
  multipleChoiceBtn.addEventListener("click", () =>
    setSection("multipleChoice")
  );
  grammarBtn.addEventListener("click", () => setSection("grammar"));

  // Vocabulary flashcard controls
  setupFlashcardControls("vocabulary");

  // Short questions flashcard controls
  setupFlashcardControls("shortQuestions");

  // Grammar flashcard controls
  setupFlashcardControls("grammar");

  // Initial letters quiz controls
  setupInitialLettersControls();

  // Multiple choice quiz controls
  setupMultipleChoiceControls();

  // Keyboard navigation
  document.addEventListener("keydown", handleKeyPress);
}

function setupFlashcardControls(sectionName) {
  // Convert camelCase to kebab-case for HTML IDs
  const htmlId =
    sectionName === "shortQuestions" ? "short-questions" : sectionName;

  const flashcard = document.getElementById(`${htmlId}-flashcard`);
  const flipBtn = document.getElementById(`${htmlId}-flip`);
  const prevBtn = document.getElementById(`${htmlId}-prev`);
  const nextBtn = document.getElementById(`${htmlId}-next`);

  if (flashcard)
    flashcard.addEventListener("click", () => flipCard(sectionName));
  if (flipBtn) flipBtn.addEventListener("click", () => flipCard(sectionName));
  if (prevBtn)
    prevBtn.addEventListener("click", () => previousItem(sectionName));
  if (nextBtn) nextBtn.addEventListener("click", () => nextItem(sectionName));
}

function setupInitialLettersControls() {
  const submitBtn = document.getElementById("initial-letters-submit");
  const nextBtn = document.getElementById("initial-letters-next");
  const input = document.getElementById("initial-letters-input");

  if (submitBtn)
    submitBtn.addEventListener("click", () => submitInitialLettersAnswer());
  if (nextBtn)
    nextBtn.addEventListener("click", () => nextInitialLettersQuestion());
  if (input) {
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        submitInitialLettersAnswer();
      }
    });
  }
}

function setupMultipleChoiceControls() {
  const submitBtn = document.getElementById("multiple-choice-submit");
  const nextBtn = document.getElementById("multiple-choice-next");

  if (submitBtn)
    submitBtn.addEventListener("click", () => submitMultipleChoiceAnswer());
  if (nextBtn)
    nextBtn.addEventListener("click", () => nextMultipleChoiceQuestion());
}

function handleUnitChange() {
  const selectedUnit = unitSelect.value;
  if (selectedUnit) {
    currentUnit = selectedUnit;
    loadSection(currentSection);
  } else {
    showScreen("welcome");
  }
}

function setSection(sectionName) {
  currentSection = sectionName;
  currentIndex = 0;

  // Update button states
  document.querySelectorAll(".section-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // Convert camelCase to kebab-case for HTML IDs
  let htmlButtonId = sectionName;
  if (sectionName === "shortQuestions") htmlButtonId = "short-questions";
  if (sectionName === "initialLetters") htmlButtonId = "initial-letters";
  if (sectionName === "multipleChoice") htmlButtonId = "multiple-choice";

  const activeBtn = document.getElementById(`${htmlButtonId}-section`);
  if (activeBtn) activeBtn.classList.add("active");

  // Load section if unit is selected
  if (currentUnit) {
    loadSection(sectionName);
  }
}

function loadSection(sectionName) {
  if (!unitsData[currentUnit]) {
    console.error("Unit not found:", currentUnit);
    return;
  }

  const unit = unitsData[currentUnit];
  const sectionConfig = sections[sectionName];
  const sectionData = unit[sectionConfig.dataKey];

  if (!sectionData || sectionData.length === 0) {
    alert(`No ${sectionConfig.name.toLowerCase()} available for this unit.`);
    return;
  }

  currentIndex = 0;
  isFlipped = false;

  showScreen(sectionName);

  if (sectionConfig.type === "flashcard") {
    displayFlashcard(sectionName);
  } else if (sectionConfig.type === "quiz") {
    displayQuestion(sectionName);
  }

  updateProgress();
}

function showScreen(screenName) {
  // Hide all screens
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.classList.remove("active");
  });

  // Convert camelCase to kebab-case for HTML IDs
  let htmlScreenName = screenName;
  if (screenName === "shortQuestions") htmlScreenName = "short-questions";
  if (screenName === "initialLetters") htmlScreenName = "initial-letters";
  if (screenName === "multipleChoice") htmlScreenName = "multiple-choice";

  // Show selected screen
  const targetScreen = document.getElementById(htmlScreenName + "-screen");
  if (targetScreen) {
    targetScreen.classList.add("active");
  }
}

// Flashcard Functions
function displayFlashcard(sectionName) {
  const unit = unitsData[currentUnit];
  const sectionConfig = sections[sectionName];
  const sectionData = unit[sectionConfig.dataKey];

  if (currentIndex >= sectionData.length) {
    currentIndex = 0;
  }

  const card = sectionData[currentIndex];

  // Convert camelCase to kebab-case for HTML IDs
  const htmlId =
    sectionName === "shortQuestions" ? "short-questions" : sectionName;

  const frontElement = document.getElementById(`${htmlId}-front`);
  const backElement = document.getElementById(`${htmlId}-back`);
  const flashcardElement = document.getElementById(`${htmlId}-flashcard`);

  if (frontElement) frontElement.textContent = card.front;
  if (backElement) backElement.textContent = card.back;

  // Reset flip state
  if (flashcardElement) {
    flashcardElement.classList.remove("flipped");
  }
  isFlipped = false;

  // Update button states
  const prevBtn = document.getElementById(`${htmlId}-prev`);
  const nextBtn = document.getElementById(`${htmlId}-next`);

  if (prevBtn) prevBtn.disabled = currentIndex === 0;
  if (nextBtn) nextBtn.disabled = currentIndex === sectionData.length - 1;
}

function flipCard(sectionName) {
  // Convert camelCase to kebab-case for HTML IDs
  const htmlId =
    sectionName === "shortQuestions" ? "short-questions" : sectionName;

  const flashcardElement = document.getElementById(`${htmlId}-flashcard`);
  if (flashcardElement) {
    flashcardElement.classList.toggle("flipped");
    isFlipped = !isFlipped;
  }
}

function previousItem(sectionName) {
  if (currentIndex > 0) {
    currentIndex--;
    displayFlashcard(sectionName);
    updateProgress();
  }
}

function nextItem(sectionName) {
  const unit = unitsData[currentUnit];
  const sectionConfig = sections[sectionName];
  const sectionData = unit[sectionConfig.dataKey];

  if (currentIndex < sectionData.length - 1) {
    currentIndex++;
    displayFlashcard(sectionName);
    updateProgress();
  }
}

// Quiz Functions
function displayQuestion(sectionName) {
  const unit = unitsData[currentUnit];
  const sectionConfig = sections[sectionName];
  const sectionData = unit[sectionConfig.dataKey];

  if (currentIndex >= sectionData.length) {
    currentIndex = 0;
  }

  const question = sectionData[currentIndex];

  if (sectionName === "initialLetters") {
    displayInitialLettersQuestion(question);
  } else if (sectionName === "multipleChoice") {
    displayMultipleChoiceQuestion(question);
  }
}

function displayInitialLettersQuestion(question) {
  const textElement = document.getElementById("initial-letters-text");
  const input = document.getElementById("initial-letters-input");
  const submitBtn = document.getElementById("initial-letters-submit");
  const nextBtn = document.getElementById("initial-letters-next");
  const feedback = document.getElementById("initial-letters-feedback");

  if (textElement) textElement.textContent = question.question;
  if (input) {
    input.value = "";
    input.disabled = false;
  }

  // Reset controls
  if (submitBtn) submitBtn.style.display = "inline-block";
  if (nextBtn) nextBtn.style.display = "none";
  if (feedback) {
    feedback.style.display = "none";
    feedback.className = "quiz-feedback";
  }
}

function displayMultipleChoiceQuestion(question) {
  const textElement = document.getElementById("multiple-choice-text");
  const optionsElement = document.getElementById("multiple-choice-options");
  const submitBtn = document.getElementById("multiple-choice-submit");
  const nextBtn = document.getElementById("multiple-choice-next");
  const feedback = document.getElementById("multiple-choice-feedback");

  if (textElement) textElement.textContent = question.question;

  // Clear previous options
  if (optionsElement) {
    optionsElement.innerHTML = "";

    // Create options
    question.options.forEach((option, index) => {
      const button = document.createElement("button");
      button.className = "option";
      button.textContent = option;
      button.addEventListener("click", () =>
        selectMultipleChoiceOption(button, index)
      );
      optionsElement.appendChild(button);
    });
  }

  // Reset controls
  if (submitBtn) submitBtn.style.display = "inline-block";
  if (nextBtn) nextBtn.style.display = "none";
  if (feedback) {
    feedback.style.display = "none";
    feedback.className = "quiz-feedback";
  }
}

function selectMultipleChoiceOption(element, value) {
  // Remove previous selections
  document
    .querySelectorAll("#multiple-choice-options .option")
    .forEach((opt) => {
      opt.classList.remove("selected");
    });

  // Select current option
  element.classList.add("selected");
  element.dataset.value = value;
}

function submitInitialLettersAnswer() {
  const unit = unitsData[currentUnit];
  const question = unit.initialLetters[currentIndex];
  const input = document.getElementById("initial-letters-input");
  const submitBtn = document.getElementById("initial-letters-submit");
  const nextBtn = document.getElementById("initial-letters-next");
  const feedback = document.getElementById("initial-letters-feedback");

  if (!input) return;

  const userAnswer = input.value.trim().toLowerCase();
  const isCorrect = question.correct.some(
    (answer) => answer.toLowerCase() === userAnswer
  );

  // Show feedback
  if (feedback) {
    feedback.style.display = "block";
    feedback.className = `quiz-feedback ${isCorrect ? "correct" : "incorrect"}`;

    if (isCorrect) {
      feedback.textContent = "Correct! Well done!";
    } else {
      feedback.textContent = `Incorrect. Acceptable answers include: ${question.correct.join(
        ", "
      )}`;
    }
  }

  // Update controls
  if (submitBtn) submitBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "inline-block";
  if (input) input.disabled = true;
}

function submitMultipleChoiceAnswer() {
  const unit = unitsData[currentUnit];
  const question = unit.multipleChoice[currentIndex];
  const selectedOption = document.querySelector(
    "#multiple-choice-options .option.selected"
  );
  const submitBtn = document.getElementById("multiple-choice-submit");
  const nextBtn = document.getElementById("multiple-choice-next");
  const feedback = document.getElementById("multiple-choice-feedback");

  if (!selectedOption) {
    alert("Please select an answer first.");
    return;
  }

  const userAnswer = parseInt(selectedOption.dataset.value);
  const isCorrect = userAnswer === question.correct;

  // Show feedback
  if (feedback) {
    feedback.style.display = "block";
    feedback.className = `quiz-feedback ${isCorrect ? "correct" : "incorrect"}`;

    if (isCorrect) {
      feedback.textContent = "Correct! Well done!";
    } else {
      feedback.textContent = `Incorrect. The correct answer is: ${
        question.options[question.correct]
      }`;
    }
  }

  // Highlight correct/incorrect options
  const options = document.querySelectorAll("#multiple-choice-options .option");
  options.forEach((option, index) => {
    if (index === question.correct) {
      option.classList.add("correct");
    } else if (option.classList.contains("selected") && !isCorrect) {
      option.classList.add("incorrect");
    }
  });

  // Update controls
  if (submitBtn) submitBtn.style.display = "none";
  if (nextBtn) nextBtn.style.display = "inline-block";
}

function nextInitialLettersQuestion() {
  const unit = unitsData[currentUnit];
  if (currentIndex < unit.initialLetters.length - 1) {
    currentIndex++;
    displayInitialLettersQuestion(unit.initialLetters[currentIndex]);
    updateProgress();
  } else {
    alert("You've completed all initial letters questions!");
    currentIndex = 0;
    displayInitialLettersQuestion(unit.initialLetters[currentIndex]);
    updateProgress();
  }
}

function nextMultipleChoiceQuestion() {
  const unit = unitsData[currentUnit];
  if (currentIndex < unit.multipleChoice.length - 1) {
    currentIndex++;
    displayMultipleChoiceQuestion(unit.multipleChoice[currentIndex]);
    updateProgress();
  } else {
    alert("You've completed all multiple choice questions!");
    currentIndex = 0;
    displayMultipleChoiceQuestion(unit.multipleChoice[currentIndex]);
    updateProgress();
  }
}

// Utility Functions
function updateProgress() {
  if (!currentUnit) {
    progressFill.style.width = "0%";
    progressText.textContent = "0 / 0";
    return;
  }

  const unit = unitsData[currentUnit];
  const sectionConfig = sections[currentSection];
  const sectionData = unit[sectionConfig.dataKey];

  if (!sectionData) {
    progressFill.style.width = "0%";
    progressText.textContent = "0 / 0";
    return;
  }

  const current = currentIndex + 1;
  const total = sectionData.length;
  const percentage = total > 0 ? (current / total) * 100 : 0;

  progressFill.style.width = percentage + "%";
  progressText.textContent = `${current} / ${total}`;
}

function handleKeyPress(event) {
  if (!currentUnit) return;

  const sectionConfig = sections[currentSection];

  switch (event.key) {
    case "ArrowLeft":
      if (sectionConfig.type === "flashcard") {
        previousItem(currentSection);
      }
      break;
    case "ArrowRight":
      if (sectionConfig.type === "flashcard") {
        nextItem(currentSection);
      }
      break;
    case " ":
      if (sectionConfig.type === "flashcard") {
        event.preventDefault();
        flipCard(currentSection);
      }
      break;
    case "Enter":
      if (currentSection === "initialLetters") {
        const submitBtn = document.getElementById("initial-letters-submit");
        const nextBtn = document.getElementById("initial-letters-next");
        if (submitBtn && submitBtn.style.display !== "none") {
          submitInitialLettersAnswer();
        } else if (nextBtn && nextBtn.style.display !== "none") {
          nextInitialLettersQuestion();
        }
      } else if (currentSection === "multipleChoice") {
        const submitBtn = document.getElementById("multiple-choice-submit");
        const nextBtn = document.getElementById("multiple-choice-next");
        if (submitBtn && submitBtn.style.display !== "none") {
          submitMultipleChoiceAnswer();
        } else if (nextBtn && nextBtn.style.display !== "none") {
          nextMultipleChoiceQuestion();
        }
      }
      break;
  }
}

// Utility function to shuffle array (for randomizing questions if needed)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
