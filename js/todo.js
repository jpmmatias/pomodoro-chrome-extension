const addTaskButton = document.getElementById("add-task");
const taskContainer = document.querySelector(".task-container");
const tasksCreatedContainer = document.querySelector(".tasks");

/**
 * @type {Array<{id: number, completed: boolean, name: string}>}
 */
let tasks = [];

const updateProgress = () => {
  const total = tasks.length;
  const completed = tasks.filter(task => task.completed).length;
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  
  const circle = document.querySelector('.progress-ring-circle');
  const text = document.querySelector('.progress-text');
  
  const radius = circle.r.baseVal.value;
  const circumference = radius * 2 * Math.PI;
  
  circle.style.strokeDasharray = `${circumference} ${circumference}`;
  circle.style.strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  text.textContent = `${percentage}%`;
};

chrome.storage.local.get("tasks", (result) => {
  tasks = result?.tasks || [];
  if (tasks.length > 0) {
    tasks.forEach((task) => {
      const taskElement = createTask(task.name, task.id, task.completed);
      tasksCreatedContainer.appendChild(taskElement);
    });
  } else {
    tasksCreatedContainer.innerHTML = "<p>No tasks</p>";
  }
  updateProgress();
});

const checkTaskToggle = (id) => {
  const task = document.getElementById(id);
  if (!task) return;

  const isCompleted = task.querySelector('input[type="checkbox"]').checked;
  tasks = tasks.map((task) =>
    task.id === Number(id) ? { ...task, completed: isCompleted } : task
  );

  chrome.storage.local.set({ tasks });
  updateProgress();
};

const removeTask = (id) => {
  tasks = tasks.filter((task) => task.id !== id);
  chrome.storage.local.set({ tasks });
  const task = document.getElementById(id);
  if (task) task.remove();
  updateProgress();
};

const createTask = (name, id, completed) => {
  const task = document.createElement("div");
  task.classList.add("task");
  task.id = id;
  task.innerHTML = `
        <span class="task-name">${name}</span>
        <input type="checkbox" ${completed ? "checked" : ""}>
        <button class="remove-task" id="button-${id}">
            <i class="fas fa-trash"></i>
        </button>
    `;

  task.querySelector('input[type="checkbox"]').addEventListener("click", () => {
    checkTaskToggle(id);
  });

  task.querySelector(`#button-${id}`).addEventListener("click", () => {
    removeTask(id);
  });

  return task;
};

const onPressEnter = (e) => {
  if (e.key === "Enter") {
    const name = e.target.value;
    const taskId =
      tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
    tasks.push({ id: taskId, completed: false, name });

    tasksCreatedContainer.appendChild(createTask(name, taskId, false));
    chrome.storage.local.set({ tasks });
    removeInput(e.target.parentElement);
  }
};

const removeInput = (input) => {
  input.remove();
};

addTaskButton.addEventListener("click", () => {
  const taskInput = document.createElement("div");
  taskInput.classList.add("task-input");
  taskInput.innerHTML = `
        <input type="text" placeholder="Task Name">
        <button class="add-button"><i class="fas fa-check"></i></button>
        <button class="cancel-button"><i class="fas fa-times"></i></button>
    `;
  
  taskInput
    .querySelector('input[type="text"]')
    .addEventListener("keydown", onPressEnter);
  
  taskInput
    .querySelector('.cancel-button')
    .addEventListener("click", () => {
      taskInput.remove();
    });

  taskInput
    .querySelector('.add-button')
    .addEventListener("click", () => {
      const input = taskInput.querySelector('input[type="text"]');
      if (input.value.trim()) {
        const name = input.value;
        const taskId = tasks.length > 0 ? Math.max(...tasks.map((task) => task.id)) + 1 : 1;
        tasks.push({ id: taskId, completed: false, name });
        tasksCreatedContainer.appendChild(createTask(name, taskId, false));
        chrome.storage.local.set({ tasks });
        taskInput.remove();
        updateProgress();
      }
    });

  taskContainer.appendChild(taskInput);
  taskInput.querySelector('input[type="text"]').focus();
});

