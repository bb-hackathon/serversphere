const vmList = []; // Локальный массив для хранения данных о виртуальных машинах
const connectionStatus = {}; // Объект для хранения статуса подключения

// Элементы интерфейса
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
                    ${isConnected ? 'Connected' : 'Disconnected'}
                </span>
            </td>
            <td>
                <button onclick="connectVM(${index}, false)" class="btn btn-primary">Open Here</button>
                <button onclick="connectVM(${index}, true)" class="btn btn-secondary">Open in New Tab</button>
                ${
                    isConnected
                        ? `<button onclick="disconnectVM(${index})" class="btn btn-warning">Disconnect</button>`
                        : ''
                }
                <button onclick="deleteVM(${index})" class="btn btn-danger">Delete</button>
            </td>
        `;
        vmTableBody.appendChild(row);
    });
}

function addVM(name, ip, port) {
    if (vmList.some(vm => vm.name === name)) {
        alert("A virtual machine with this name already exists. Please use a unique name.");
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
            if (newTab) {
                window.open(data.url, "_blank"); 
            } else {
                vncFrame.src = data.url; 
                modal.style.display = "block"; 
            }
            connectionStatus[vm.name] = true;
            renderVMList(); 
        } else {
            alert("Error: " + data.message);
        }
    })
    .catch(err => {
        console.error("Error:", err);
        alert("Failed to connect. Check console for details.");
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
        alert("Invalid IP address format. Please enter a valid IP.");
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
