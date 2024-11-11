const focusTimeInput = document.getElementById("focusTime");
const breakTimeInput = document.getElementById("breakTime");
const saveButton = document.getElementById("save");

chrome.storage.local.get(["focusTime", "breakTime"], (result) => {
  focusTimeInput.value = result.focusTime || 25;
  breakTimeInput.value = result.breakTime || 5;
});

saveButton.addEventListener("click", () => {
  const focusTime = focusTimeInput.value;
  const breakTime = breakTimeInput.value;

  if (!focusTime || !breakTime) {
    return;
  }

  if (focusTime < 1 || focusTime > 60 || breakTime < 1 || breakTime > 60) {
    return;
  }

  chrome.storage.local.set({
    focusTime,
    breakTime,
    timer: 0,
    isRunning: false
  });
});
    