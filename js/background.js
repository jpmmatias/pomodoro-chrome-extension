let START_FOCUS_TIME = "25:00";
let START_BREAK_TIME = "05:00";

const createNotification = (title, message) => {
  const notificationId = 'pomodoro-' + Date.now();
  chrome.notifications.create(notificationId, {
    type: 'basic',
    iconUrl: '/icons/icon.png',
    title: title,
    message: message,
    priority: 2,
    requireInteraction: true
  });
};

const formatTime = (time, isBreakTime, focusTime, breakTime) => {
  const currentTime = isBreakTime ? `${breakTime}:00` : `${focusTime}:00`;
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

const updateBadge = (time, isBreakTime, focusTime, breakTime) => {
  chrome.action.setBadgeText({
    text: formatTime(time, isBreakTime, focusTime, breakTime)
  });
};

chrome.alarms.create("pomodoro", {
  periodInMinutes: 1 / 60,
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "pomodoro") {
    chrome.storage.local.get(["timer", "isRunning", "isBreakTime", "focusTime", "breakTime"], (result) => {
      if (result.isRunning) {
        const timer = result.timer + 1;
        const currentTime = result.isBreakTime ? `${result.breakTime}:00` : `${result.focusTime}:00`;
        const [startMinutes, startSeconds] = currentTime.split(":").map(Number);
        const totalStartSeconds = startMinutes * 60 + startSeconds;

        if (timer >= totalStartSeconds) {
          const notifications = {
            true: ["Break Time Ended!", "Time to get back to work!"],
            false: ["Focus Time Ended!", "Great job! Time for a break."]
          };
          
          const [title, message] = notifications[result.isBreakTime];
          createNotification(title, message);
          
          chrome.storage.local.set({
            timer: 0,
            isRunning: false,
            isBreakTime: !result.isBreakTime
          });
          updateBadge(0, !result.isBreakTime, result.focusTime, result.breakTime);
        } else {
          chrome.storage.local.set({ timer });
          updateBadge(timer, result.isBreakTime, result.focusTime, result.breakTime);
        }
      }
    });
  }
});

chrome.storage.local.get(["timer", "isRunning", "focusTime", "breakTime", "isBreakTime"], (result) => {
  const defaultValues = {
    timer: "timer" in result ? result.timer : 0,
    isRunning: "isRunning" in result ? result.isRunning : false,
    focusTime: "focusTime" in result ? result.focusTime : 25,
    breakTime: "breakTime" in result ? result.breakTime : 5,
    isBreakTime: "isBreakTime" in result ? result.isBreakTime : false,
  };
  
  chrome.storage.local.set(defaultValues);
  updateBadge(
    defaultValues.timer, 
    defaultValues.isBreakTime, 
    defaultValues.focusTime, 
    defaultValues.breakTime
  );
});
