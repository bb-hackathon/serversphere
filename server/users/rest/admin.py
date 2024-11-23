from fastapi import APIRouter, Depends, Request

from users.infra.dependency import get_cursor
from users.infra.exceptions import NotAdmin
from users.infra.user_repo import UserRepo
from users.rest.tokens import detokenize

def check_admin_rights(request: Request, cur = Depends(get_cursor)):
    cookie = request.cookies.get('user')
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
admin_router

@admin_router.post('/give_admin')
def give_admin(request:Request, login: str, cur = Depends(get_cursor)):
    usr_repo = UserRepo(cur)

