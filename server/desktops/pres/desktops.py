from fastapi import APIRouter, Depends, Request, Response

from desktops.exceptions import AlreadyReserved, InvalidReservation
from desktops.infra.desktop_repo import DesktopRepo
from desktops.infra.dto.reservation import ReservationTimeDTO
from users.infra.dependency import get_cursor, get_user_id
from starlette import status


desktop_router = APIRouter(prefix="/desktops")


@desktop_router.get("/")
def desktops(request: Request, _=Depends(get_user_id), cur=Depends(get_cursor)):
    dsk_repo = DesktopRepo(cur)
    return dsk_repo.get()


@desktop_router.post("/reserve")
def reserve(
    request: Request,
    name,
    reserve_until,
    reserve_from,
    user_id=Depends(get_user_id),
    cur=Depends(get_cursor),
):
    dsk_repo = DesktopRepo(cur)
    try:
        return dsk_repo.reserve(name, reserve_from, reserve_until, user_id)
    except (AlreadyReserved, InvalidReservation) as e:
        return Response(e.message, status_code=status.HTTP_400_BAD_REQUEST)


@desktop_router.get("/get_reservations")
def get_reservations(request:Request, name:str, _=Depends(get_user_id), cur=Depends(get_cursor)):
    dsk_repo = DesktopRepo(cur)
    return list(map(lambda x: ReservationTimeDTO(**x), dsk_repo.get_reservations()))

@desktop_router.get("/fetch_desktops")
def get_reservations(request:Request, cur=Depends(get_cursor)):
    dsk_repo = DesktopRepo(cur)
    return dsk_repo.get_multipass_vm()