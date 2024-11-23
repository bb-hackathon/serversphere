from ast import excepthandler
import datetime
from fastapi import Depends
from requests import request

from desktops.infra.desktop_repo import DesktopRepo
from desktops.infra.dto.reservation import ReservationDTO
from users.infra.dependency import get_cursor


def check_for_reservations():
    gen = get_cursor()
    cur = gen.__next__()
    dsk_repo = DesktopRepo(cur)
    ress = dsk_repo.get_reservations()
    for res in ress:
        res = ReservationDTO(**res)
        if (
            datetime.datetime.fromisoformat(res.reservedUntil).timestamp()
            < datetime.datetime.now().timestamp()
        ):
            
            dsk_repo.delete_reservation(res.id)
    print(1)
    res = dsk_repo.get()
    for vm in res:
        try:
            res = request("GET", f"http://{vm.ip}:{vm.port}/serversphere/agent/status", timeout=1.5)
            assert res.status_code == 200
            dsk_repo.update_status(isAlive=True, id=vm.id)
            
        except:
            dsk_repo.update_status(isAlive=False, id=vm.id)
            
        



    try:
        gen.__next__()
    except:
        pass
