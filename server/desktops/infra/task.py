from ast import excepthandler
import datetime
import logging
from fastapi import Depends
from requests import request

from desktops.infra.desktop_repo import DesktopRepo
from desktops.infra.dto.reservation import ReservationDTO
from users.infra.dependency import get_cursor
from users.infra.user_repo import UserRepo


def check_for_reservations():
    gen = get_cursor()
    cur = gen.__next__()
    dsk_repo = DesktopRepo(cur)
    usr_repo = UserRepo(cur)
    ress = dsk_repo.get_reservations()
    for res in ress:
        res = ReservationDTO(**res)
        if (
            datetime.datetime.fromisoformat(res.reservedUntil).timestamp()
            < datetime.datetime.now().timestamp()
        ):
            dsk_repo.delete_reservation(res.id)
            vm = dsk_repo.get_desktop_by_id(res.reservedDesktop)
            try:
                req = request(
                    "POST",
                    f"http://{vm.ip}:{vm.port}/serversphere/agent/revoke_access",
                    timeout=1.5,
                )
                if req.status_code >= 400:
                    logging.critical(f"Failed to revoke access from {vm.ip}:{vm.port}")
                    continue
            except:
                logging.critical(f"Failed to revoke access from {vm.ip}:{vm.port}")

        if (
            datetime.datetime.fromisoformat(res.reservedFrom).timestamp()
            < datetime.datetime.now().timestamp()
            and not res.started
        ):
            vm = dsk_repo.get_desktop_by_id(res.reservedDesktop)
            user = usr_repo.get_user_by_id(res.reservedBy)
            if not vm:
                continue
            if not vm.isAlive:
                continue
            if not user:
                continue
            if not user.sshKey:
                continue
            try:
                req = request(
                    "POST",
                    f"http://{vm.ip}:{vm.port}/serversphere/agent/credentials/sshd",
                    json={"pubkey": user.sshKey},
                    timeout=1,
                )
                if req.status_code >= 400:
                    logging.warning(f"Failed to add ssh keys on {vm.ip}:{vm.port}")
                    continue
            except Exception as e:
                logging.warning(f"Failed to add ssh keys on {vm.ip}:{vm.port}")
                continue
            res.started = True

    res = dsk_repo.get()

    for vm in res:
        try:
            res = request(
                "GET",
                f"http://{vm.ip}:{vm.port}/serversphere/agent/status",
                timeout=1.5,
            )
            assert res.status_code == 200
            dsk_repo.update_status(isAlive=True, id=vm.id)

        except:
            dsk_repo.update_status(isAlive=False, id=vm.id)

    try:
        gen.__next__()
    except:
        pass
