const focusTimeInput = document.getElementById("focusTime");
const saveButton = document.getElementById("save");
const timer = document.getElementById("timer");

saveButton.addEventListener("click", () => {
  const focusTime = focusTimeInput.value;
  if (!focusTime) {
    return;
  }

  if (focusTime < 1 || focusTime > 60) {
    return;
  }

  chrome.storage.local.set({ focusTime , timer: 0, isRunning: false});
  timer.innerText = `${focusTime}:00`;
});
    