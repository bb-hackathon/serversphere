from sqlite3 import connect
from fastapi import FastAPI
import uvicorn
from users.infra.dto.user import UserCreateDTO
from users.infra.exceptions import UserAlreadyExists
from users.infra.sql_queries import CREATE_NEW_USER
from users.infra.user_repo import UserRepo
from users.rest.exc_handling import handlers
from users.rest.rest import user_router
from users.rest.admin import admin_router
from db import CREATE_TABLE_DESKTOPS, CREATE_TABLE_USERS
from fastapi.middleware.cors import CORSMiddleware

def init():
    app = FastAPI()
    app.include_router(user_router)
    app.include_router(admin_router)
    app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
    handlers(app)
    return app


def startapp():
    with connect('db.sqlite') as conn:
        conn.execute(CREATE_TABLE_USERS)
        conn.execute(CREATE_TABLE_DESKTOPS)
        conn.commit()
        try:
            usr_repo = UserRepo(cursor=conn.cursor())
            usr_repo.register_new_user(UserCreateDTO(login="admin", sshKey="Blank",isAdmin=True, password="admin"))
        except UserAlreadyExists:
            print("Skipping pre-init...")
        conn.commit()
    uvicorn.run(init(),host="0.0.0.0", port=8000)

if __name__ == "__main__":
    startapp()