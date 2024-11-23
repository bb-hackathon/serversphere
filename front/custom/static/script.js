//TODO: fix user login status
const vmList = [
    { name: "Ubuntu Linux", ip: "93.183.82.91", port: "5901" } // Предустановленное устройство
];
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

function openChartsPage(vmName) {
    window.location.href = `/charts?vm=${encodeURIComponent(vmName)}`;
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
                <button onclick="openChartsPage('${vm.name}')" class="btn btn-info">Показать графики</button>
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
        body: JSON.stringify(vm)
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
        body: JSON.stringify({ name: vm.name })
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
