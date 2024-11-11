const START_FOCUS_TIME = "25:00";
const startButton = document.getElementById("start");
const stopButton = document.getElementById("stop");
const resetButton = document.getElementById("reset");
const timer = document.getElementById("timer");

const toggleIsRunning = (isRunning) => {
  chrome.storage.local.set({ isRunning });
};

startButton.addEventListener("click", () => {
  toggleIsRunning(true);
});

stopButton.addEventListener("click", () => {
  toggleIsRunning(false);
});

const resetTimer = () => {
  chrome.storage.local.set({ timer: 0, isRunning: false });
  timer.innerText = START_FOCUS_TIME;
};

resetButton.addEventListener("click", resetTimer);

const formatTime = (time) => {
  const [startMinutes, startSeconds] = START_FOCUS_TIME.split(":").map(Number);
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
