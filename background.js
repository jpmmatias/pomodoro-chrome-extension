chrome.alarms.create("pomodoro", {
  periodInMinutes: 1 / 60,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pomodoro") {
    chrome.storage.local.get(["timer", "isRunning", "focusTime"], (result) => {
      if (result.isRunning) {
      const timer = result.timer + 1;
      console.log(timer);

        chrome.storage.local.set({
          timer,
        });

      }
    });
  }
});

chrome.storage.local.get(["timer", "isRunning", "focusTime"], (result) => {
  chrome.storage.local.set({
    timer: "timer" in result ? result.timer : 0,
    isRunning: "isRunning" in result ? result.isRunning : false,
    focusTime: "focusTime" in result ? result.focusTime : true,
  });
});
