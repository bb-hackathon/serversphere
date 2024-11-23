from fastapi import APIRouter, Depends, Request, Response

from desktops.infra.desktop_repo import DesktopRepo
from desktops.infra.dto.desktops import DesktopCreateDTO
from users.infra.dependency import get_cursor
from users.infra.exceptions import DesktopAlreadyExists, NotAdmin
from users.infra.user_repo import UserRepo
from users.rest.tokens import detokenize
from starlette import status


def check_admin_rights(request: Request, cur=Depends(get_cursor)):
    cookie = request.cookies.get("user")
    if not cookie:
        raise NotAdmin

    id = detokenize(cookie)
    if not id:
        raise NotAdmin

    usr_repo = UserRepo(cur)
    user = usr_repo.get_user_by_id(str(id))
    if not user.isAdmin:
        raise NotAdmin


admin_router = APIRouter(prefix="/admin", dependencies=[Depends(check_admin_rights)])


@admin_router.post("/give_admin")
def give_admin(request: Request, login: str, cur=Depends(get_cursor)):
    usr_repo = UserRepo(cur)
    usr_repo.invert_admin(login)


@admin_router.get("/users")
def users(cur=Depends(get_cursor)):
    usr_repo = UserRepo(cur)
    return usr_repo.get_users()


@admin_router.post("/register_desktop")
def register_desktop(desktop: DesktopCreateDTO, cur=Depends(get_cursor)):
    dsk_repo = DesktopRepo(cur)
    try:
        dsk_repo.create_new_desktop(desktop)
    except DesktopAlreadyExists as e:
        return Response(e.message, status_code=status.HTTP_409_CONFLICT)

    return Response("Created", status_code=status.HTTP_201_CREATED)
