const vmList = [
    { name: "Ubuntu Linux", ip: "93.183.82.91", port: "5901" }
];

let currentUserLogin = "";
const connectionStatus = {};

const vmTableBody = document.getElementById("vm-table-body");
const addForm = document.getElementById("add-form");
const addBtn = document.getElementById("add-btn");
const saveBtn = document.getElementById("save-btn");
const cancelBtn = document.getElementById("cancel-btn");
const modal = document.getElementById("modal");
const modalHeader = document.getElementById("modal-header");
const vncFrame = document.getElementById("vnc-frame");
const closeModalBtn = document.getElementById("close-modal");

let isDragging = false;
let offsetX = 0, offsetY = 0;

function showNotification(message, type) {
    const notification = $(`<div class="notification ${type}">${message}</div>`);
    $(".notifications").append(notification);
    setTimeout(() => notification.remove(), 4000);
}

function fetchUsers() {
    fetch("http://127.0.0.1:8000/admin/users", { credentials: "include" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Не удалось загрузить пользователей");
            }
            return response.json();
        })
        .then(users => {
            const userTableBody = document.getElementById("user-table-body");
            userTableBody.innerHTML = "";

            users.forEach(user => {
                const isCurrentUser = user.login === currentUserLogin; 
                
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${user.id}</td>
                    <td>${user.login}</td>
                    <td>${user.isAdmin ? "Да" : "Нет"}</td>
                    <td>
                        ${
                            user.isAdmin
                                ? isCurrentUser
                                    ? `<span class="badge bg-success">Администратор</span>`
                                    : `
                                        <span class="badge bg-success">Администратор</span>
                                        <button class="btn btn-warning btn-sm" onclick="makeAdmin('${user.login}')">Обжаловать</button>
                                      ` 
                                : isCurrentUser
                                    ? "" 
                                    : `<button class="btn btn-danger btn-sm" onclick="makeAdmin('${user.login}')">Сделать администратором</button>`
                        }
                        ${
                            isCurrentUser
                                ? "" 
                                : `<button class="btn btn-danger btn-sm" onclick="deleteUser('${user.login}')">Удалить</button>`
                        }
                    </td>
                `;
                userTableBody.appendChild(row);
            });
        })
        .catch(error => {
            console.error("Ошибка загрузки пользователей:", error);
            showNotification("Не удалось загрузить список пользователей.", "error");
        });
}


function makeAdmin(login) {
    const url = `http://127.0.0.1:8000/admin/give_admin?login=${encodeURIComponent(login)}`;
    
    fetch(url, {
        method: "POST",
        credentials: "include"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Ошибка при изменении статуса администратора");
        }
        return response.json();
    })
    .then(() => {
        showNotification(`Пользователь "${login}" назначен администратором`, "success");
        fetchUsers(); 
    })
    .catch(error => {
        console.error("Ошибка назначения администратора:", error);
        showNotification("Не удалось назначить администратора.", "error");
    });
}

function deleteUser(login) {
    const url = `http://127.0.0.1:8000/users/?login=${encodeURIComponent(login)}`;
    
    fetch(url, {
        method: "DELETE",
        credentials: "include"
    })
    .then(response => {
        if (!response.ok) {
            showNotification(`Ошибка: ${data.message}`, "error");
            throw new Error("Ошибка при удалении пользователя");
        } else {
            showNotification(`Пользователь "${login}" успешно удалён`, "success");
            fetchUsers(); 
        }
        return response;
    })
    .catch(error => {
        console.error("Ошибка удаления пользователя:", error);
        showNotification("Не удалось удалить пользователя.", "error");
    });
}

function logoutUser() {
    fetch("http://127.0.0.1:8000/users/logout", {
        method: "POST",
        credentials: "include"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Ошибка выхода");
        } else {
            showNotification("Вы успешно вышли из системы.", "success");
        }
        return response;
    })
    .then(() => {
        window.location.href = "/";
    })
    .catch(error => {
        console.error("Ошибка выхода:", error);
        showNotification("Не удалось выйти из системы.", "error");
    });
}

document.addEventListener("DOMContentLoaded", () => {
    checkUserStatus();
});

function checkUserStatus() {
    fetch("http://127.0.0.1:8000/users/status", {
        credentials: "include"
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Failed to fetch user status");
        }
        return response.json();
    })
    .then(userStatus => {
        const isAdmin = userStatus.isAdmin;
        const { id, login: name, sshKey } = userStatus;

        currentUserLogin = name;

        const userInfo = document.getElementById("user-info");
        userInfo.innerHTML = `
            <div class="card shadow-sm p-3 bg-light rounded">
                <div class="card-body">
                    <h5 class="card-title">Здравствуйте, <strong>${name}</strong>!</h5>
                    <p class="card-text mb-1"><small class="text-muted">ID: ${id}</small></p>
                    <p class="card-text"><small class="text-muted">SSH Key:</small><br><code>${sshKey}</code></p>
                </div>
            </div>
        `;

        const logoutBtn = document.getElementById("logout-btn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", logoutUser);
        }

        if (isAdmin) {
            console.log("Пользователь является администратором. Загружаем панель администратора...");
            fetchUsers();
        } else {
            console.log("Пользователь не является администратором. Загружаем клиентскую страницу...");
            window.location.href = "/client";
        }
    })
    .catch(error => {
        console.error("Ошибка проверки статуса пользователя:", error);
        window.location.href = "/";
    });
}

function openChartsPage(vmName) {
    window.location.href = `/charts?vm=${encodeURIComponent(vmName)}`;
}

function openBookVM(index) {
    const vmName = vmList[index].name; D
    showBookingModal(vmName);
}

function showBookingModal(vmName) {
    const modalHtml = `
        <div class="modal" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="bookingModalLabel">Бронирование для ${vmName}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <label for="startDatetime">Дата и время начала</label>
                        <input type="datetime-local" id="startDatetime" class="form-control">
                        
                        <label for="endDatetime" class="mt-3">Дата и время окончания</label>
                        <input type="datetime-local" id="endDatetime" class="form-control">
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Закрыть</button>
                        <button type="button" class="btn btn-primary" onclick="bookVM('${vmName}')">Забронировать</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const bookingModal = new bootstrap.Modal(document.getElementById('bookingModal'));
    bookingModal.show();
}

function bookVM(vmName) {
    const startDatetime = document.getElementById('startDatetime').value;
    const endDatetime = document.getElementById('endDatetime').value;

    if (!startDatetime || !endDatetime) {
        alert('Пожалуйста, выберите оба времени начала и окончания бронирования');
        return;
    }

    const bookingData = {
        vmName: vmName,
        startDatetime: startDatetime,
        endDatetime: endDatetime
    };

    const bookingModal = bootstrap.Modal.getInstance(document.getElementById('bookingModal'));
    bookingModal.hide();
    console.log(JSON.stringify(bookingData))

    fetch('/api/bookVM', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingData),
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Бронирование успешно создано!');
        } else {
            alert('Ошибка при бронировании. Попробуйте снова.');
        }
    })
    .catch(error => {
        console.error('Ошибка при отправке данных:', error);
        alert('Ошибка при отправке данных. Попробуйте позже.');
    });
}

function renderVMList() {
    vmTableBody.innerHTML = ""; 
    vmList.forEach((vm, index) => {
        const isConnected = connectionStatus[vm.name] || false;

        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${vm.name}</td>
            <td>${vm.ip}</td>
            <td>${vm.port}</td>
            <td>
                <span class="badge ${isConnected ? 'bg-success' : 'bg-secondary'}">
                    ${isConnected ? 'Онлайн' : 'Офлайн'}
                </span>
            </td>
            <td>
                <button onclick="connectVM(${index}, false)" class="btn btn-primary">Открыть в окне</button>
                <button onclick="connectVM(${index}, true)" class="btn btn-secondary">Открыть в новой вкладке</button>
                ${
                    isConnected
                        ? `<button onclick="disconnectVM(${index})" class="btn btn-warning">Отключить</button>`
                        : ''
                }
                <button onclick="openChartsPage('${index}')" class="btn btn-info">Показать графики</button>
                <button onclick="openBookVM(${index})" class="btn btn-success">Бронь</button>
                <button onclick="deleteVM(${index})" class="btn btn-danger">Удалить</button>
            </td>
        `;

        vmTableBody.appendChild(row);
    });
}

function addVM(name, ip, port) {
    if (vmList.some(vm => vm.name === name)) {
        alert("Имя уже занято. Используйте другое");
        return;
    }

    vmList.push({ name, ip, port });
    renderVMList();
}

function deleteVM(index) {
    const vm = vmList[index];
    disconnectVM(index); 
    vmList.splice(index, 1);
    delete connectionStatus[vm.name];
    renderVMList();
}

function connectVM(index, newTab) {
    const vm = vmList[index];

    if (connectionStatus[vm.name]) {
        const existingUrl = `http://localhost:${connectionStatus[vm.name].port}/vnc.html?host=localhost&port=${connectionStatus[vm.name].port}`;
        if (newTab) {
            window.open(existingUrl, "_blank");
        } else {
            vncFrame.src = existingUrl;
            modal.style.display = "block";
        }
        return;
    }

    fetch("/api/connect", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(vm),
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const port = new URL(data.url).port;
            connectionStatus[vm.name] = {
                connected: true,
                port: parseInt(port, 10)
            };

            if (newTab) {
                window.open(data.url, "_blank");
            } else {
                vncFrame.src = data.url;
                modal.style.display = "block";
            }
            renderVMList();
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Не удалось подключиться. Проверьте настройки.");
    });
}

function disconnectVM(index) {
    const vm = vmList[index];
    fetch("/api/disconnect", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: vm.name }),
        credentials: "include"
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            connectionStatus[vm.name] = false; 
            if (vncFrame.src.includes(vm.ip)) {
                modal.style.display = "none";
                vncFrame.src = "";
            }
            renderVMList(); 
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => console.error("Error:", err));
}

closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    vncFrame.src = "";
});

modalHeader.addEventListener("mousedown", (e) => {
    isDragging = true;
    offsetX = e.clientX - modal.offsetLeft;
    offsetY = e.clientY - modal.offsetTop;
});

document.addEventListener("mousemove", (e) => {
    if (isDragging) {
        modal.style.left = `${e.clientX - offsetX}px`;
        modal.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener("mouseup", () => {
    isDragging = false;
});

addBtn.addEventListener("click", () => {
    addForm.style.display = "block";
    addBtn.style.display = "none";
});

cancelBtn.addEventListener("click", () => {
    addForm.style.display = "none";
    addBtn.style.display = "block";
});

document.getElementById("vm-ip").addEventListener("input", (event) => {
    const input = event.target;
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$/;

    if (!ipPattern.test(input.value)) {
        input.style.borderColor = "red";
    } else {
        input.style.borderColor = ""; 
    }
});

document.getElementById("vm-port").addEventListener("input", (event) => {
    const input = event.target;
    input.value = input.value.replace(/\D/g, ""); 
});

saveBtn.addEventListener("click", () => {
    const vmName = document.getElementById("vm-name").value;
    const vmIp = document.getElementById("vm-ip").value;
    const vmPort = document.getElementById("vm-port").value;

    const ipPattern = /^(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])(\.(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9]?[0-9])){3}$/;

    if (!vmName || !vmIp || !vmPort) {
        alert("Please fill in all fields.");
        return;
    }

    if (!ipPattern.test(vmIp)) {
        alert("Неверный формат IP адресса");
        return;
    }

    addVM(vmName, vmIp, vmPort);
    addForm.style.display = "none";
    addBtn.style.display = "block";

    document.getElementById("vm-name").value = "";
    document.getElementById("vm-ip").value = "";
    document.getElementById("vm-port").value = "";
});

renderVMList();
