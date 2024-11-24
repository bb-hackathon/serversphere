## `serversphere`

**Кейс:** "Платформа управления доступом к вычислительным ресурсам"\
**Команда:** "Толстый указатель"

---

## Развёртывание решения

1. Необходимо обзавестить образами (`.iso` / `.img`) ОС, доступ к которым хотим осуществлять.
  **ВАЖНО:** Нужны `live` образы, или образы предназначенные для работы в `cloud`-среде (наиболее подходящие).
2. Для реализации виртуализованного стенда подойдёт любой гипервизор (тестировалось на `QEMU/KVM`, `VirtualBox`, а так же на платформе `LXC`).
  Для реализации bare-metal стенда с физическими хостами, нужно включить на каждом из них загрузку через `PXE` / `iPXE`.
3. Перед запуском физических хостов или виртуальных машин, необходимо запустить серверную часть проекта (см. [`server/`](https://github.com/bb-hackathon/serversphere/tree/main/server)). Так же необходимо запустить PXE-инфраструктуру (DHCP/TFTP сервер) для передачи образов ОС на машины.
4. Каждая из машин может осуществить загрузку в любой вид ОС (в зависимости от того, как настроен сервер).
5. Облачные системы самостоятельно настроят на себе все необходимое ПО (`sshd`, `vncserver`, а так же кастомный [`agent/`](https://github.com/bb-hackathon/serversphere/tree/main/agent) нашего решения).

## Агент

На `cloud`-системах **устанавливается и запускается полностью автоматически**, никаких действий не требуется.
Для развёртывание вне автоматизированной среды см. [`agent/`](https://github.com/bb-hackathon/serversphere/tree/main/agent).
