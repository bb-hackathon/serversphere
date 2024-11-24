
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
<td>${user.isAdmin ? "Администратор" : "Пользователь"}</td>
<td>
${user.isAdmin
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
${isCurrentUser
                        ? ""
                        : `<button class="btn btn-danger btn-sm" onclick="deleteUser('${user.login}')">Удалить</button>`
                    }
</td>
`;
                userTableBody.appendChild(row);
            });
            fetchVMs();
        })
        .catch(error => {
            console.error("Ошибка загрузки пользователей:", error);
            showNotification("Не удалось загрузить список пользователей.", "error");
        });
}
function fetchVMs() {
    fetch("http://127.0.0.1:8000/desktops/", { credentials: "include" })
        .then(response => {
            if (!response.ok) {
                throw new Error("Не удалось загрузить список ВМ");
            }
            return response.json();
        })
        .then(vms => {
            renderVMList(vms);
        })
        .catch(error => {
            console.error("Ошибка загрузки ВМ:", error);
            showNotification("Не удалось загрузить список ВМ.", "error");
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
            showNotification(`Смена статуса у "${login}"`, "success");
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
            }
            return response;
        })
        .then(() => {
            showNotification("Вы вышли из аккаунта", "success");
            setTimeout(() => window.location.href = "/", 2000);
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

function openBookVM(vmName) {
    fetchReservations(vmName);
}

function fetchReservations(vmName) {
    fetch(`http://127.0.0.1:8000/desktops/get_reservations?name=${encodeURIComponent(vmName)}`, {
        credentials: "include"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Не удалось загрузить бронирования");
            }
            return response.json();
        })
        .then(reservations => {
            const userReservations = reservations.filter(reservation => reservation.login === currentUserLogin);
            const commonReservations = reservations.filter(reservation => reservation.login !== currentUserLogin);

            showBookingModal(vmName, userReservations, commonReservations);
        })
        .catch(error => {
            console.error("Ошибка загрузки бронирований:", error);
            showNotification("Не удалось загрузить бронирования.", "error");
        });
}

function showBookingModal(vmName, userReservations, commonReservations) {
    const userReservationList = userReservations.map(reservation => `
        <li>
            <strong>С:</strong> ${new Date(reservation.reservedFrom).toLocaleString()} 
            <strong>До:</strong> ${new Date(reservation.reservedUntil).toLocaleString()}
        </li>`).join("");

    const commonReservationList = commonReservations.map(reservation => `
        <li>
            <strong>Пользователь:</strong> ${reservation.login}<br>
            <strong>С:</strong> ${new Date(reservation.reservedFrom).toLocaleString()} 
            <strong>До:</strong> ${new Date(reservation.reservedUntil).toLocaleString()}
        </li>`).join("");

    const modalHtml = `
        <div class="modal" id="bookingModal" tabindex="-1" aria-labelledby="bookingModalLabel" aria-hidden="true">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="bookingModalLabel">Бронирование для ${vmName}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                        <p><strong>Ваши бронирования:</strong></p>
                        <ul>${userReservationList || "<li>У вас нет текущих бронирований</li>"}</ul>
                        <hr>
                        <p><strong>Общие бронирования:</strong></p>
                        <ul>${commonReservationList || "<li>Нет общих бронирований</li>"}</ul>
                        <hr>
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

    bookingModal._element.addEventListener('hidden.bs.modal', () => {
        bookingModal.dispose();
        document.getElementById('bookingModal').remove();
    });
}

function bookVM(vmName) {
    const startDatetime = document.getElementById('startDatetime').value;
    const endDatetime = document.getElementById('endDatetime').value;

    if (!startDatetime || !endDatetime) {
        alert('Пожалуйста, выберите оба времени начала и окончания бронирования');
        return;
    }

    const reserveUrl = `http://127.0.0.1:8000/desktops/reserve?name=${encodeURIComponent(vmName)}&reserve_from=${encodeURIComponent(startDatetime)}&reserve_until=${encodeURIComponent(endDatetime)}`;

    fetch(reserveUrl, {
        method: 'POST',
        credentials: "include"
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || "Ошибка бронирования");
                });
            }
            return response.json();
        })
        .then(() => {
            showNotification("Бронирование успешно создано!", "success");
            fetchReservations(vmName);
        })
        .catch(error => {
            console.error("Ошибка при бронировании:", error);
            showNotification("Не удалось создать бронирование.", "error");
        });
}

function renderVMList(vms) {
    vmTableBody.innerHTML = "";
    vms.forEach(vm => {
        const isConnected = vm.isAlive;

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
                <button onclick="connectVM('${vm.name}', '${vm.ip}', ${vm.port}, false)" class="btn btn-primary">Открыть в окне</button>
                <button onclick="connectVM('${vm.name}', '${vm.ip}', ${vm.port}, true)" class="btn btn-secondary">Открыть в новой вкладке</button>
                ${isConnected
                    ? `<button onclick="disconnectVM('${vm.name}')" class="btn btn-warning">Отключить текущую сессию</button>
                       <button onclick="rebootVM('${vm.name}')" class="btn btn-warning">Перезагрузить устройство</button>`
                    : ''
                }
                <button onclick="openChartsPage('${vm.name}')" class="btn btn-info">Показать графики</button>
                <button onclick="openBookVM('${vm.name}')" class="btn btn-success">Бронь</button>
                <button onclick="deleteVM('${vm.name}')" class="btn btn-danger">Удалить</button>
            </td>
        `;
        vmTableBody.appendChild(row);
    });
}

function rebootVM(vmName) {
    fetch(`127.0.0.1:8000/desktops/reboot?name=${encodeURIComponent(vmName)}`, {
        credentials: "include"
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Не удалось перезагрузить");
            }
            return response.json();
        })
        .then(data => {
            showNotification(`"${vmName}" будет перезагружено`, "success");
        })
        .catch(error => {
            console.error("Ошибка перезагрузки:", error);
            showNotification("Не удалось перезагрузить. Устройство офлайн", "error");
        });
}


function addVM(ip, port, name, type = "Vm") {
    const url = "http://127.0.0.1:8000/admin/register_desktop";
    const requestData = {
        ip: ip,
        port: parseInt(port, 10),
        name: name,
        type: type
    };
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(requestData),
        credentials: "include"
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || "Ошибка при добавлении ВМ");
                });
            }
            return response;
        })
        .then(data => {
            showNotification(`ВМ "${name}" успешно добавлена`, "success");
            fetchVMs(); 
        })
        .catch(error => {
            console.error("Ошибка добавления ВМ:", error);
            showNotification(`Не удалось добавить ВМ "${name}". ${error.message}`, "error");
        });
}

function deleteVM(name) {
    const url = `http://127.0.0.1:8000/desktops/?name=${encodeURIComponent(name)}`;
    fetch(url, {
        method: "DELETE",
        credentials: "include"
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => {
                    throw new Error(data.message || "Ошибка при удалении ВМ");
                });
            }
            return response.json();
        })
        .then(data => {
            showNotification(`ВМ "${name}" успешно удалена`, "success");
            fetchVMs(); 
        })
        .catch(error => {
            console.error("Ошибка удаления ВМ:", error);
            showNotification(`Не удалось удалить ВМ "${name}". ${error.message}`, "error");
        });
}
function connectVM(name, ip, port, newTab) {
    if (connectionStatus[name]) {
        const existingUrl = `http://localhost:${connectionStatus[name].port}/vnc.html?host=localhost&port=${connectionStatus[name].port}`;
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
        body: JSON.stringify({ name, ip, port }),
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const port = new URL(data.url).port;
                connectionStatus[name] = {
                    connected: true,
                    port: parseInt(port, 10)
                };
                if (newTab) {
                    window.open(data.url, "_blank");
                } else {
                    vncFrame.src = data.url;
                    modal.style.display = "block";
                }
                fetchVMs();
            } else {
                alert("Ошибка: " + data.message);
            }
        })
        .catch(err => {
            console.error("Ошибка подключения:", err);
            alert("Не удалось подключиться. Проверьте настройки.");
        });
}
function disconnectVM(name) {
    fetch("/api/disconnect", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name }),
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                connectionStatus[name] = false;
                if (vncFrame.src.includes(name)) {
                    modal.style.display = "none";
                    vncFrame.src = "";
                }
                fetchVMs(); 
            } else {
                alert("Ошибка: " + data.message);
            }
        })
        .catch(err => console.error("Ошибка отключения:", err));
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
        alert("Пожалуйста, заполните все поля.");
        return;
    }
    if (!ipPattern.test(vmIp)) {
        alert("Неверный формат IP адреса.");
        return;
    }
    addVM(vmIp, vmPort, vmName);
    addForm.style.display = "none";
    addBtn.style.display = "block";
    document.getElementById("vm-name").value = "";
    document.getElementById("vm-ip").value = "";
    document.getElementById("vm-port").value = "";
});

renderVMList();
