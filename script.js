const API_BASE = "https://hk65backend-ewcz.onrender.com";

let username = "";
let score = 0;
let currentAnswer = 0;

// Bắt đầu game
function startGame() {
  const input = document.getElementById("username");
  if (!input.value.trim()) {
    alert("Vui lòng nhập tên!");
    return;
  }
  username = input.value.trim();
  document.getElementById("name-screen").style.display = "none";
  document.getElementById("game-screen").style.display = "block";
  generateQuestion();
  loadLeaderboard();

  // Enter để trả lời
  document.getElementById("answer").addEventListener("keypress", (e) => {
    if (e.key === "Enter") checkAnswer();
  });
}

// Sinh câu hỏi
function generateQuestion() {
  const a = Math.floor(Math.random() * 10) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  document.getElementById("question").innerText = `${a} + ${b} = ?`;
  currentAnswer = a + b;
  document.getElementById("answer").value = "";
  document.getElementById("warning").innerText = "";
}

// Kiểm tra đáp án
function checkAnswer() {
  const input = document.getElementById("answer").value.trim();

  if (!input || isNaN(input)) {
    document.getElementById("warning").innerText = "Cần nhập một số";
    return;
  }

  if (parseInt(input) === currentAnswer) {
    score++;
    document.getElementById("score").innerText = score;
    flyScore("+1");
  }
  generateQuestion();
  saveScore();
}

// Hiệu ứng điểm bay
function flyScore(text) {
  const container = document.getElementById("score-fly-container");
  const span = document.createElement("span");
  span.className = "score-fly";
  span.innerText = text;
  container.appendChild(span);

  setTimeout(() => span.remove(), 1000);
}

// Lưu điểm
async function saveScore() {
  await fetch(`${API_URL}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, score })
  });
  loadLeaderboard();
}

// Load bảng xếp hạng
async function loadLeaderboard() {
  const res = await fetch(`${API_URL}/leaderboard`);
  const data = await res.json();
  const list = document.getElementById("leaderboard");
  list.innerHTML = "";
  data.forEach((row, i) => {
    const li = document.createElement("li");
    li.innerText = `${i+1}. ${row.username} - ${row.score}`;
    list.appendChild(li);
  });
}
