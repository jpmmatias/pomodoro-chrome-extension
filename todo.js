const addTaskButton = document.getElementById("add-task");
const taskContainer = document.querySelector(".task-container");
const tasksCreatedContainer = document.querySelector(".tasks");

/**
 * @type {Array<{id: number, completed: boolean, name: string}>}
 */
let tasks = [];

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
});

const checkTaskToggle = (id) => {
  const task = document.getElementById(id);
  if (!task) return;

  const isCompleted = task.querySelector('input[type="checkbox"]').checked;
  tasks = tasks.map((task) =>
    task.id === Number(id) ? { ...task, completed: isCompleted } : task
  );

  chrome.storage.local.set({ tasks });
};

const removeTask = (id) => {
  tasks = tasks.filter((task) => task.id !== id);
  chrome.storage.local.set({ tasks });
  const task = document.getElementById(id);
  if (task) task.remove();
};

const createTask = (name, id, completed) => {
  const task = document.createElement("div");
  task.classList.add("task");
  task.id = id;
  task.innerHTML = `
        <span class="task-name">${name}</span>
        <input type="checkbox" ${completed ? "checked" : ""}>
        <button class="remove-task" id="button-${id}">Remove</button>
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
        <input type="button" value="X">
    `;
  taskInput
    .querySelector('input[type="text"]')
    .addEventListener("keydown", onPressEnter);
  taskInput
    .querySelector('input[type="button"]')
    .addEventListener("click", () => {
      taskInput.remove();
    });

  taskContainer.appendChild(taskInput);
});
