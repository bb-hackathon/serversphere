from fastapi import FastAPI, Request, Response

from users.infra.exceptions import NotAdmin, NotAuthorized
from starlette import status

def not_admin_handler(request: Request, exc: NotAdmin):
    return Response(content=exc.message, status_code=status.HTTP_401_UNAUTHORIZED)

def not_auth_handler(request: Request, exc: NotAuthorized):
    return Response(content=exc.message, status_code=status.HTTP_401_UNAUTHORIZED)


def handlers(app: FastAPI):
    app.add_exception_handler(NotAdmin, not_admin_handler)
    app.add_exception_handler(NotAuthorized, not_auth_handler)