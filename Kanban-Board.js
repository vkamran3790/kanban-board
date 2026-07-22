const todoList = document.querySelector("#todo-column .task-list");
const doingList = document.querySelector("#doing-column .task-list");
const doneList = document.querySelector("#done-column .task-list");

const taskLists = document.querySelectorAll(".task-list");
const columns = document.querySelectorAll(".column");

const searchInput = document.querySelector("#search-input");

const taskForm = document.querySelector(".task-form");

const taskTitleInput = document.querySelector("#task-title");
const priorityInput = document.querySelector("#priority");
const dueDateInput = document.querySelector("#due-date");

const filterPriority = document.querySelector("#filter-priority");
const sortSelect = document.querySelector("#sort-select");

const todoCount = document.querySelector("#todo-column .task-count");
const doingCount = document.querySelector("#doing-column .task-count");
const doneCount = document.querySelector("#done-column .task-count");

const modal = document.querySelector("#task-modal");
const modalTitle = document.querySelector("#modal-title");
const modalPriority = document.querySelector("#modal-priority");
const modalDate = document.querySelector("#modal-date");
const modalStatus = document.querySelector("#modal-status");
const closeModal = document.querySelector(".close-modal");

const editModal = document.querySelector("#edit-modal");
const editTitle = document.querySelector("#edit-title");
const editPriority = document.querySelector("#edit-priority");
const editDate = document.querySelector("#edit-date");
const saveEdit = document.querySelector("#save-edit");
const closeEdit = document.querySelector(".close-edit");

const themeBtn = document.querySelector("#theme-btn");

let editingTask = null;

let tasks = [];

loadTheme();
loadTasks();
renderTasks(getFilteredTasks());

taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const title = taskTitleInput.value;
    const priority = priorityInput.value;
    const dueDate = dueDateInput.value;

    if (title === "") {
        alert("Enter task title");
        return;
    }

    const newTask = {
        id: Date.now(),
        title: title,
        status: "todo",
        priority: priority,
        dueDate: dueDate
    };

    tasks.push(newTask);

    saveTasks();

    renderTasks(getFilteredTasks());

    taskForm.reset();
});

searchInput.addEventListener("input", () => {
    renderTasks(getFilteredTasks());
});

filterPriority.addEventListener("change", () => {
    renderTasks(getFilteredTasks());
});

sortSelect.addEventListener("change", () => {
    renderTasks(getFilteredTasks());
});

function dragStart(card, task) {
    card.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData(
            "text/plain",
            task.id
        );
        card.classList.add("dragging");
    });
    card.addEventListener("dragend", () => {
        card.classList.remove("dragging");
    });
}

taskLists.forEach((list) => {

    list.addEventListener("dragover", (event) => {
        event.preventDefault();
        list.classList.add("drag-over");
    });

    list.addEventListener("dragleave", () => {
        list.classList.remove("drag-over");
    });

    list.addEventListener("drop", (event) => {
        list.classList.remove("drag-over");

        const taskId = Number(event.dataTransfer.getData("text/plain"));

        const task = tasks.find((item) => {
            return item.id === taskId;
        });

        if (!task) return;

        task.status = list.dataset.status;

        saveTasks();
        renderTasks(getFilteredTasks());

    });
});

function renderTasks(taskList) {

    todoList.innerHTML = "";
    doingList.innerHTML = "";
    doneList.innerHTML = "";

    taskList.forEach((task) => {
        const card = document.createElement("div");
        card.classList.add("task-card");
        card.draggable = true;

        card.addEventListener("click", (event) => {
            if (event.target.tagName === "BUTTON") {
                return;
            }
            openTaskModal(task);
        });

        if (task.priority === "high") {
            card.classList.add("high-card");
        } else if (task.priority === "medium") {
            card.classList.add("medium-card");
        } else if (task.priority === "low") {
            card.classList.add("low-card");
        }

        card.addEventListener("dragover", (event) => {
            event.preventDefault();
        });

        card.addEventListener("drop", (event) => {

            event.stopPropagation();

            const draggedId = Number(
                event.dataTransfer.getData("text/plain")
            );

            const draggedIndex = tasks.findIndex((item) => {
                return item.id === draggedId;
            });


            const targetIndex = tasks.findIndex((item) => {
                return item.id === task.id;
            });

            if (draggedIndex === -1 || targetIndex === -1) return;

            const draggedTask = tasks[draggedIndex];

            if (draggedTask.status !== task.status) {
                return;
            }

            tasks.splice(draggedIndex, 1);

            tasks.splice(targetIndex, 0, draggedTask);

            saveTasks();

            renderTasks(getFilteredTasks());
        });
        card.dataset.id = task.id;
        dragStart(card, task);

        const title = document.createElement("h3");
        title.textContent = task.title;

        const priority = document.createElement("p");
        priority.textContent = `Priority: ${task.priority}`;

        priority.classList.add("priority");

        if (task.priority === "high") {
            priority.classList.add("high");
        } else if (task.priority === "medium") {
            priority.classList.add("medium");
        } else if (task.priority === "low") {
            priority.classList.add("low");
        }

        const date = document.createElement("p");
        date.textContent = `Due: ${task.dueDate}`;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "del";

        deleteBtn.addEventListener("click", () => {
            tasks = tasks.filter((item) => {
                return item.id !== task.id;
            });

            saveTasks();
            renderTasks(getFilteredTasks());
        });

        const editBtn = document.createElement("button");
        editBtn.textContent = "edit";

        editBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            openEditModal(task);
        });

        card.append(editBtn);
        card.append(deleteBtn);
        card.append(title);
        card.append(priority);
        card.append(date);

        if (task.status === "todo") {
            todoList.append(card);
        }

        else if (task.status === "doing") {
            doingList.append(card);
        }

        else if (task.status === "done") {
            doneList.append(card);
        }
    });
    updateCount();
}

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}

function loadTheme() {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "true") {
        document.body.classList.add("dark");
    }
}

function loadTasks() {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
}

function updateCount() {
    todoCount.textContent =
        tasks.filter((task) => task.status === "todo").length;

    doingCount.textContent =
        tasks.filter((task) => task.status === "doing").length;

    doneCount.textContent =
        tasks.filter((task) => task.status === "done").length;
}

columns.forEach((column) => {

    column.addEventListener("dragover", (event) => {
        event.preventDefault();
    });

    column.addEventListener("drop", (event) => {

        const taskId = Number(
            event.dataTransfer.getData("text/plain")
        );

        const task = tasks.find((item) => {
            return item.id === taskId;
        });

        if (!task) return;

        // if (column.id === "todo-column") {
        //     task.status = "todo";
        // }

        // if (column.id === "doing-column") {
        //     task.status = "doing";
        // }

        // if (column.id === "done-column") {
        //     task.status = "done";
        // }

        task.status = column.id.replace("-column","");

        saveTasks();
        renderTasks(tasks);
    });
});

function getFilteredTasks() {

    let filtered = [...tasks];

    const searchText = searchInput.value.toLowerCase();
    const priority = filterPriority.value;
    const sort = sortSelect.value;


    if (searchText) {
        filtered = filtered.filter((task) => {
            return task.title.toLowerCase().includes(searchText);
        });
    }

    if (priority !== "all") {
        filtered = filtered.filter((task) => {
            return task.priority === priority;
        });
    }

    if (sort === "date-new") {
        filtered.sort((a, b) => {
            return b.id - a.id;
        });
    }

    if (sort === "date-old") {
        filtered.sort((a, b) => {
            return a.id - b.id;
        });
    }

    if (sort === "priority") {

        const priorityValue = {
            high: 100,
            medium: 50,
            low: 1
        };

        filtered.sort((a, b) => {
            return priorityValue[b.priority] - priorityValue[a.priority];
        });

    }

    return filtered;
}

function openTaskModal(task) {

    modalTitle.textContent = task.title;

    modalPriority.textContent =
        `Priority: ${task.priority}`;


    modalDate.textContent =
        `Due Date: ${task.dueDate}`;


    modalStatus.textContent =
        `Status: ${task.status}`;


    modal.classList.add("active");

}

closeModal.addEventListener("click", () => {
    modal.classList.remove("active");
});

function openEditModal(task) {

    editingTask = task;
    editTitle.value = task.title;
    editPriority.value = task.priority;
    editDate.value = task.dueDate;
    editModal.classList.add("active");
}

saveEdit.addEventListener("click", () => {

    editingTask.title = editTitle.value;
    editingTask.priority = editPriority.value;
    editingTask.dueDate = editDate.value;

    saveTasks();
    renderTasks(getFilteredTasks());

    editModal.classList.remove("active");
});

closeEdit.addEventListener("click", () => {
    editModal.classList.remove("active");
});

modal.addEventListener("click",(event)=>{
    if(event.target === modal){
        modal.classList.remove("active");
    }
});

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");

    localStorage.setItem(
        "theme",
        isDark
    );

    themeBtn.textContent =
    isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
});