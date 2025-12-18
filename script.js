let tasks = [];
let currentFilter = "all";

const taskInput = document.querySelector('#task-input');
const deadlineInput = document.querySelector('#deadline-input');
const addBtn = document.querySelector('#add-btn');
const taskList = document.querySelector('#task-list');
const counter = document.querySelector('#counter');
const searchInput = document.querySelector('#search');
const selectAll = document.querySelector('#select-all');
const filterButtons = document.querySelectorAll('.filters button');
const emptyMsg = document.querySelector('#empty-msg');

// Add Task
addBtn.addEventListener('click', () => {
  if (taskInput.value.trim() === "") return;

  tasks.push({
    id: Date.now(),
    description: taskInput.value,
    completed: false,
    deadline: deadlineInput.value || null,
    notified: false
  });

  taskInput.value = "";
  deadlineInput.value = "";
  save();
  render();
});

// Filter Buttons 
filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    currentFilter = btn.dataset.filter;
    filterButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render();
  });
});

// Search
searchInput.addEventListener('input', render);

// Select All
selectAll.addEventListener('change', () => {
  tasks.forEach(t => t.completed = selectAll.checked);
  save();
  render();
});

// Render task
function render() {
  taskList.innerHTML = "";

  let filtered = [...tasks];

  if (currentFilter === "active")
    filtered = filtered.filter(t => !t.completed);
  if (currentFilter === "completed")
    filtered = filtered.filter(t => t.completed);
  if (currentFilter === "overdue") {
    const today = new Date().toISOString().split('T')[0];
    filtered = filtered.filter(t => t.deadline && t.deadline < today && !t.completed);
  }

  filtered = filtered.filter(t =>
    t.description.toLowerCase().includes(searchInput.value.toLowerCase())
  );

  emptyMsg.style.display = filtered.length ? "none" : "block";

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = "task-item";

  // Checkbox task
    const cb = document.createElement('input');
    cb.type = "checkbox";
    cb.checked = task.completed;

    cb.onchange = () => {
      task.completed = cb.checked;
      save();
      render();
    };

    const span = document.createElement('span');
    span.textContent = task.description;
    span.className = "task-text";
    if (task.completed) span.classList.add('completed');
    
    // Edit Task 
    const edit = document.createElement('button');
    edit.textContent = "Edit";
    edit.className = "edit-btn";
    edit.onclick = () => {
      const txt = prompt("Edit task", task.description);
      if (txt) task.description = txt;
      save();
      render();
    };

    // Delete Task
    const del = document.createElement('button');
    del.textContent = "✖";
    del.className = "delete-btn";
    del.onclick = () => {
      tasks = tasks.filter(t => t.id !== task.id);
      save();
      render();
    };

    // overdue
    const today = new Date().toISOString().split('T')[0];
    if (task.deadline && task.deadline < today && !task.completed)
      li.classList.add('overdue');

    li.append(cb, span, edit, del);
    taskList.appendChild(li);
  });

  counter.textContent = `${tasks.filter(t => !t.completed).length} tasks remaining`;

  selectAll.checked = tasks.length && tasks.every(t => t.completed);
}

//Local Storage
function save() {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function load() {
  const data = localStorage.getItem("tasks");
  if (data) tasks = JSON.parse(data);
}

//API Fetch
function fetchFromAPI() {
    fetch("https://jsonplaceholder.typicode.com/todos?_limit=10")
    .then(res => res.json())
    .then(data => {
      tasks = data.map(item => ({
        id: item.id,
        description: item.title,
        completed: item.completed,
        deadline: null,
        notified: false
      }));
      save();
      render();
    });
}

// Notification
function checkDeadlines() {
  const today = new Date().toISOString().split('T')[0];
  tasks.forEach(t => {
    if (t.deadline && t.deadline <= today && !t.completed && !t.notified) {
      alert("Task overdue: " + t.description);
      t.notified = true;
    }
  });
  save();
}
load();

const apiLoaded = localStorage.getItem("apiLoaded");

if (!apiLoaded) {
  fetchFromAPI();
  localStorage.setItem("apiLoaded", "true");
} else {
  render();
}

setInterval(checkDeadlines, 60000);

