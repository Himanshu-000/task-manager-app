let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
let currentFilter = "all";

function saveTasks() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTasks();
}

function addTask() {
  let input = document.getElementById("taskInput");

  if (input.value.trim() === "") {
    alert("Enter a task!");
    return;
  }

  tasks.push({
    text: input.value,
    completed: false
  });

  input.value = "";
  saveTasks();
}

function renderTasks() {
  let list = document.getElementById("taskList");
  list.innerHTML = "";

  tasks
    .filter(task => {
      if (currentFilter === "completed") return task.completed;
      if (currentFilter === "pending") return !task.completed;
      return true;
    })
    .forEach((task, index) => {

      let li = document.createElement("li");

      let span = document.createElement("span");
      span.textContent = task.text;

      if (task.completed) span.classList.add("completed");

      span.onclick = () => {
        task.completed = !task.completed;
        saveTasks();
      };

      // Edit button
      let edit = document.createElement("button");
      edit.textContent = "Edit";
      edit.onclick = () => {
        let newText = prompt("Edit task:", task.text);
        if (newText) {
          task.text = newText;
          saveTasks();
        }
      };

      // Delete button
      let del = document.createElement("button");
      del.textContent = "X";
      del.onclick = () => {
        tasks.splice(index, 1);
        saveTasks();
      };

      li.appendChild(span);
      li.appendChild(edit);
      li.appendChild(del);

      list.appendChild(li);
    });
}

function filterTasks(type) {
  currentFilter = type;
  renderTasks();
}

function clearAll() {
  tasks = [];
  saveTasks();
}

// Enter key support
document.getElementById("taskInput").addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    addTask();
  }

  if (tasks.length === 0) {
  list.innerHTML = "<p style='text-align:center;'>No tasks yet 😴</p>";
  return;
}
});

renderTasks();