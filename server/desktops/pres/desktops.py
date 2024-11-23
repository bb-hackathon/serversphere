from fastapi import APIRouter, Depends, Request

from desktops.infra.desktop_repo import DesktopRepo
from users.infra.dependency import get_cursor, get_user_id


desktop_router = APIRouter(prefix='/desktops')


@desktop_router.get('/')
def desktops(request: Request, _ = Depends(get_user_id), cur = Depends(get_cursor)):
    dsk_repo = DesktopRepo(cur)
    return dsk_repo.get()
