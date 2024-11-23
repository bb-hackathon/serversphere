from fastapi import APIRouter, Depends, Form, Request, Response
import jwt

from users.infra.dependency import get_cursor
from users.infra.dto.user import UserAuthDTO, UserCreateDTO
from users.infra.exceptions import UserAlreadyExists
from users.infra.user_repo import UserRepo
from users.rest.tokens import detokenize, tokenize
from starlette import status

user_router = APIRouter(prefix="/users")

@user_router.post('/login')
def login(login: str = Form(), password: str = Form(), cur = Depends(get_cursor)):
    user_repo = UserRepo(cur)
    res = user_repo.validate_user(login, password)
    if not res:
        return Response("Failed to login", status_code=status.HTTP_401_UNAUTHORIZED)
    cookie = tokenize(res)
    response = Response(content="Login successful")
    response.set_cookie(key="user", value=cookie, httponly=True)
    return response

@user_router.get('/status')
def user_status(request: Request, cur = Depends(get_cursor)):

    cookie = request.cookies.get('user')
    print(cookie)
    if not cookie:
        return Response("Failed to get user info", status_code=status.HTTP_400_BAD_REQUEST)
    try:
        id = detokenize(cookie)
    except jwt.exceptions.DecodeError:
        return Response("Failed to get user info", status_code=status.HTTP_400_BAD_REQUEST)
    return UserRepo(cur).get_user_by_id(str(id))


@user_router.post("/register")
def register(user: UserCreateDTO, cur = Depends(get_cursor)):
    user_repo = UserRepo(cur)
    try:
        user_repo.register_new_user(user)
    except UserAlreadyExists as e:
        return Response(content=e.message, status_code=status.HTTP_409_CONFLICT)

    return Response("Created", status.HTTP_201_CREATED)


