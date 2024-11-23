from flask import Flask, request, jsonify, render_template
import subprocess
import atexit
import psutil

app = Flask(__name__)

novnc_processes = {}
base_port = 6080 

@app.route('/')
def index():
    return render_template('reg.html')

@app.route('/index')
def list():
    return render_template('index.html')

@app.route('/charts')
def charts():
    vm_name = request.args.get('vm', 'Unknown VM')
    return render_template('charts.html', vm_name=vm_name)

@app.route('/api/metrics', methods=['GET'])
def system_status():
    cpu_load = psutil.cpu_percent(interval=1)

    memory = psutil.virtual_memory()
    memory_usage = memory.percent 

    status = {
        'cpu_load': cpu_load,
        'memory_usage': memory_usage,
    }

    return jsonify(status)

@app.route('/api/connect', methods=['POST'])
def connect_vm():
    data = request.json
    vm_name = data.get('name')
    vm_ip = data.get('ip')
    vm_port = data.get('port')

    if not all([vm_name, vm_ip, vm_port]):
        return jsonify({"success": False, "message": "All fields are required."}), 400

    vnc_proxy_port = base_port + len(novnc_processes)

    if vm_name in novnc_processes:
        novnc_processes[vm_name]["process"].terminate()

    novnc_command = f"../utils/novnc_proxy --vnc {vm_ip}:{vm_port} --listen {vnc_proxy_port}"
    try:
        process = subprocess.Popen(novnc_command, shell=True)

        novnc_processes[vm_name] = {
            "process": process,
            "port": vnc_proxy_port
        }

        vnc_url = f"http://localhost:{vnc_proxy_port}/vnc.html?host=localhost&port={vnc_proxy_port}"
        return jsonify({"success": True, "url": vnc_url})
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

@app.route('/api/disconnect', methods=['POST'])
def disconnect_vm():
    data = request.json
    vm_name = data.get('name')

    if vm_name in novnc_processes:
        novnc_processes[vm_name]["process"].terminate()
        del novnc_processes[vm_name]
        return jsonify({"success": True, "message": f"{vm_name} disconnected."})
    else:
        return jsonify({"success": False, "message": "No process found for the VM."})

@atexit.register
def cleanup():
    for process_info in novnc_processes.values():
        process_info["process"].terminate()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=80)

