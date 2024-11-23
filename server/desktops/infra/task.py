import datetime
from fastapi import Depends

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
            print(f"вот хуила протухшая: {res.reservedDesktop}")
            dsk_repo.delete_reservation(res.id)

    try:
        gen.__next__()
    except:
        pass
