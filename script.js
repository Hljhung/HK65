let playerName = "";
let score = 0;
let timeLeft = 0;
let timer;
let selectedTime = 30; // mặc định 30 giây

// Đổi thành link Render backend của bạn
const API = "https://hk65backend-ewcz.onrender.com"; 

// Các mốc thời gian hợp lệ (ước của 90 ≥ 10)
const validTimes = [10, 15, 18, 30, 45, 90];
const timeSelect = document.getElementById("time-select");
validTimes.forEach(t => {
  let opt = document.createElement("option");
  opt.value = t;
  opt.textContent = t + " giây";
  timeSelect.appendChild(opt);
});

// Bắt đầu game
document.getElementById("start-btn").addEventListener("click", () => {
  playerName = document.getElementById("player-name").value.trim();
  selectedTime = parseInt(timeSelect.value);

  if (!playerName) {
    alert("Bạn cần nhập tên trước khi chơi!");
    return;
  }

  document.getElementById("setup").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("show-name").textContent = playerName;

  score = 0;
  document.getElementById("score").textContent = score;

  timeLeft = selectedTime;
  document.getElementById("time").textContent = timeLeft;

  startTimer();
  generateQuestion();
});

// Sinh phép toán ngẫu nhiên (2 số < 100, chia phải nguyên)
function generateQuestion() {
  let num1 = Math.floor(Math.random() * 100);
  let num2 = Math.floor(Math.random() * 100);
  let operators = ["+", "-", "×", "÷"];
  let operator = operators[Math.floor(Math.random() * operators.length)];

  if (operator === "-") {
    if (num2 > num1) [num1, num2] = [num2, num1]; // tránh âm
  }
  if (operator === "÷") {
    num2 = Math.floor(Math.random() * 99) + 1; // tránh chia 0
    let multiplier = Math.floor(Math.random() * 10); // số nhân ngẫu nhiên
    num1 = num2 * multiplier; // để chia hết
  }

  let question = `${num1} ${operator} ${num2}`;
  let answer;
  switch (operator) {
    case "+": answer = num1 + num2; break;
    case "-": answer = num1 - num2; break;
    case "×": answer = num1 * num2; break;
    case "÷": answer = num1 / num2; break;
  }

  document.getElementById("question").textContent = question;
  document.getElementById("answer").value = "";
  document.getElementById("answer").dataset.correct = answer;
}

// Nhấn Enter để trả lời
document.getElementById("answer").addEventListener("keydown", (e) => {
  if (e.key === "Enter") checkAnswer();
});

// Kiểm tra đáp án
function checkAnswer() {
  const input = document.getElementById("answer");
  const warning = document.getElementById("warning");
  const value = input.value.trim();

  if (!/^-?\d+$/.test(value)) {
    warning.textContent = "Cần nhập một số!";
    return;
  }
  warning.textContent = "";

  let correct = parseInt(input.dataset.correct);
  if (parseInt(value) === correct) {
    let addScore = Math.floor(90 / selectedTime);
    score += addScore;
    document.getElementById("score").textContent = score;
    showFloatingScore("+" + addScore);
  }

  generateQuestion();
}

// Hiệu ứng điểm bay lên
function showFloatingScore(text) {
  const float = document.createElement("div");
  float.textContent = text;
  float.classList.add("floating-score");
  float.style.left = "50%";
  float.style.top = "50%";
  document.body.appendChild(float);

  setTimeout(() => float.remove(), 1000);
}

// Đếm ngược thời gian
function startTimer() {
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("time").textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      endGame();
    }
  }, 1000);
}

// Kết thúc game
function endGame() {
  document.getElementById("game").innerHTML = `
    <h2>Hết giờ!</h2>
    <p>Điểm của bạn: <strong>${score}</strong></p>
    <button onclick="saveScore()">Lưu điểm</button>
  `;
}

// Gửi điểm về server Render
function saveScore() {
  fetch(API + "/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName, score })
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById("game").innerHTML += `
      <h3>Bảng xếp hạng</h3>
      <ul>${data.map(p => `<li>${p.name}: ${p.score}</li>`).join("")}</ul>
    `;
  });
}
