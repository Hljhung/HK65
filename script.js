const API = "https://hk65backend-ewcz.onrender.com"; // backend Render của bạn

let playerName = "";
let score = 0;
let timeLeft = 0;
let timer;
let currentAnswer = 0;

// Tính các ước của 90 >= 10
function getDivisorsOf90() {
  const divisors = [];
  for (let i = 10; i <= 90; i++) {
    if (90 % i === 0) divisors.push(i);
  }
  return divisors;
}

// Tạo options cho select thời gian
window.onload = () => {
  const select = document.getElementById("timeSelect");
  getDivisorsOf90().forEach(t => {
    const opt = document.createElement("option");
    opt.value = t;
    opt.textContent = t + " giây";
    select.appendChild(opt);
  });
  loadLeaderboard();

  document.getElementById("answerInput").addEventListener("keydown", e => {
    if (e.key === "Enter") checkAnswer();
  });
};

async function startGame() {
  playerName = document.getElementById("playerName").value.trim();
  if (!playerName) {
    alert("Hãy nhập tên!");
    return;
  }

  const selectedTime = parseInt(document.getElementById("timeSelect").value);
  timeLeft = selectedTime;

  // Nếu admin -> reset bảng xếp hạng
  if (playerName === "admin hljhung") {
    await fetch(`${API}/reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: playerName })
    });
    alert("Admin đã reset bảng xếp hạng!");
  }

  document.getElementById("welcomeScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  document.getElementById("timeLeft").innerText = timeLeft;

  loadQuestion();
  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timeLeft").innerText = timeLeft;
    if (timeLeft <= 0) endGame();
  }, 1000);
}

function loadQuestion() {
  let a = Math.floor(Math.random() * 100);
  let b = Math.floor(Math.random() * 100);
  const ops = ["+", "-", "*", "/"];
  let op = ops[Math.floor(Math.random() * ops.length)];

  if (op === "/") {
    while (b === 0 || a % b !== 0) {
      a = Math.floor(Math.random() * 100);
      b = Math.floor(Math.random() * 100) || 1;
    }
  }

  document.getElementById("question").innerText = `${a} ${op} ${b} = ?`;
  currentAnswer = eval(`${a} ${op} ${b}`);
  document.getElementById("answerInput").value = "";
}

function checkAnswer() {
  const input = document.getElementById("answerInput").value.trim();
  const warning = document.getElementById("warning");

  if (input === "" || isNaN(input)) {
    warning.innerText = "Cần nhập một số";
    return;
  }
  warning.innerText = "";

  if (parseInt(input) === currentAnswer) {
    const points = 90 / parseInt(document.getElementById("timeSelect").value);
    score += points;
    document.getElementById("score").innerText = score;

    showFloatingPoints("+" + points);
  }
  loadQuestion();
}

function showFloatingPoints(text) {
  const floating = document.createElement("div");
  floating.className = "floating";
  floating.innerText = text;
  floating.style.left = "50%";
  floating.style.top = "50%";
  document.getElementById("floatingPoints").appendChild(floating);
  setTimeout(() => floating.remove(), 1000);
}

function endGame() {
  clearInterval(timer);
  document.getElementById("gameScreen").style.display = "none";
  document.getElementById("endScreen").style.display = "block";
  document.getElementById("finalScore").innerText = score;
}

async function saveScore() {
  await fetch(`${API}/leaderboard`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: playerName, score })
  });
  loadLeaderboard();
}

async function loadLeaderboard() {
  const res = await fetch(`${API}/leaderboard`);
  const data = await res.json();
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  data.forEach(p => {
    const li = document.createElement("li");
    li.textContent = `${p.name}: ${p.score}`;
    list.appendChild(li);
  });
}
