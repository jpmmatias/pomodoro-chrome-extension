let START_FOCUS_TIME = "25:00";
let START_BREAK_TIME = "05:00";
let isBreakTime = false;

const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");
const timer = document.getElementById("timer");
const breakButton = document.getElementById("break");

chrome.storage.local.get(["focusTime", "breakTime", "isBreakTime"], (result) => {
  START_FOCUS_TIME = `${result.focusTime || 25}:00`;
  START_BREAK_TIME = `${result.breakTime || 5}:00`;
  isBreakTime = result.isBreakTime || false;
  startButton.textContent = "Start Focus";
  breakButton.textContent = "Start Break";
});

const toggleIsRunning = (isRunning) => {
  chrome.storage.local.set({ isRunning });
};

const startFocus = () => {
  isBreakTime = false;
  chrome.storage.local.set({ isBreakTime, timer: 0 });
  resetTimer();
  toggleIsRunning(true);
};

const startBreak = () => {
  isBreakTime = true;
  chrome.storage.local.set({ isBreakTime, timer: 0 });
  resetTimer();
  toggleIsRunning(true);
};

const formatTime = (time) => {
  const currentTime = isBreakTime ? START_BREAK_TIME : START_FOCUS_TIME;
  const [startMinutes, startSeconds] = currentTime.split(":").map(Number);
  const totalStartSeconds = startMinutes * 60 + startSeconds;
  const remainingSeconds = totalStartSeconds - time;

  if (remainingSeconds <= 0) {
    return "00:00";
  }

  const remainingMinutes = Math.floor(remainingSeconds / 60);
  const finalSeconds = remainingSeconds % 60;

  return `${remainingMinutes.toString().padStart(2, "0")}:${finalSeconds
    .toString()
    .padStart(2, "0")}`;
};

const resetTimer = () => {
  chrome.storage.local.set({ timer: 0, isRunning: false });
  timer.innerText = isBreakTime ? START_BREAK_TIME : START_FOCUS_TIME;
};

startButton.addEventListener("click", startFocus);
breakButton.addEventListener("click", startBreak);

stopButton.addEventListener("click", () => {
  toggleIsRunning(false);
});

resetButton.addEventListener("click", resetTimer);

const updateBadge = (time) => {
  chrome.action.setBadgeText({
    text: formatTime(time),
  });
};

function updateTimer() {
  chrome.storage.local.get(["timer", "isRunning"], (result) => {
    if (result.isRunning) {
      timer.innerText = formatTime(result.timer);
      updateBadge(result.timer);
    }
  });
}

setInterval(updateTimer, 1000);

chrome.storage.local.get(["timer", "isRunning"], (result) => {
  updateBadge(result.timer || 0);
  timer.innerText = formatTime(result.timer || 0);
});
