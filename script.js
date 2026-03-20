document.addEventListener("DOMContentLoaded", showTasks);

// ---------- AI PRIORITY ----------
function getPriority(task) {
    task = task.toLowerCase();

    if (task.includes("exam") || task.includes("urgent") || task.includes("submit")) {
        return "high";
    }
    if (task.includes("project") || task.includes("meeting")) {
        return "medium";
    }
    return "low";
}

// ---------- ADD TASK ----------
function addTask() {
    let taskInput = document.getElementById("taskInput");
    let dateInput = document.getElementById("dateInput");

    let task = taskInput.value.trim();
    let date = dateInput.value;

    if (task === "") {
        alert("Enter a task!");
        return;
    }

    let priority = getPriority(task);

    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.push({
        id: Date.now(), // unique id (IMPORTANT for drag fix)
        task,
        date,
        priority,
        completed: false
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

    taskInput.value = "";
    dateInput.value = "";

    showTasks();
}

// ---------- SHOW TASKS ----------
function showTasks() {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    let taskList = document.getElementById("taskList");
    let taskCount = document.getElementById("taskCount");

    taskList.innerHTML = "";

    tasks.forEach((t) => {
        let li = document.createElement("li");

        li.setAttribute("draggable", true);
        li.dataset.id = t.id;

        li.classList.add(t.priority);
        if (t.completed) li.classList.add("completed");

        li.innerHTML = `
            <span onclick="toggleComplete(${t.id})">
                ${t.task} (${t.date || "No date"})
            </span>
            <button class="delete" onclick="deleteTask(${t.id})">❌</button>
        `;

        addDragEvents(li);

        taskList.appendChild(li);
    });

    taskCount.innerText = tasks.length + " Tasks";
}

// ---------- DELETE ----------
function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks = tasks.filter(t => t.id !== id);

    localStorage.setItem("tasks", JSON.stringify(tasks));

    showTasks();
}

// ---------- TOGGLE COMPLETE ----------
function toggleComplete(id) {
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    tasks.forEach(t => {
        if (t.id === id) {
            t.completed = !t.completed;
        }
    });

    localStorage.setItem("tasks", JSON.stringify(tasks));

    showTasks();
}

// ---------- DARK MODE ----------
function toggleDark() {
    document.body.classList.toggle("dark");
}

// ---------- DRAG EVENTS ----------
function addDragEvents(element) {

    element.addEventListener("dragstart", () => {
        element.classList.add("dragging");
    });

    element.addEventListener("dragend", () => {
        element.classList.remove("dragging");
        saveOrder();
    });
}

// ---------- DRAG OVER ----------
document.getElementById("taskList").addEventListener("dragover", function (e) {

    e.preventDefault();

    const dragging = document.querySelector(".dragging");
    const afterElement = getDragAfterElement(this, e.clientY);

    if (afterElement == null) {
        this.appendChild(dragging);
    } else {
        this.insertBefore(dragging, afterElement);
    }
});

// ---------- POSITION LOGIC ----------
function getDragAfterElement(container, y) {

    const elements = [...container.querySelectorAll("li:not(.dragging)")];

    return elements.reduce((closest, child) => {

        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;

        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }

    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// ---------- SAVE ORDER ----------
function saveOrder() {
    let items = document.querySelectorAll("#taskList li");
    let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    let newTasks = [];

    items.forEach(item => {
        let id = Number(item.dataset.id);
        let task = tasks.find(t => t.id === id);

        if (task) {
            newTasks.push(task);
        }
    });

    localStorage.setItem("tasks", JSON.stringify(newTasks));
}