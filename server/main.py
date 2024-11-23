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
from db import CREATE_TABLE_USERS

def init():
    app = FastAPI()
    app.include_router(user_router)
    app.include_router(admin_router)
    handlers(app)
    return app


def startapp():
    with connect('db.sqlite') as conn:
        conn.execute(CREATE_TABLE_USERS)
        try:
            usr_repo = UserRepo(cursor=conn.cursor())
            usr_repo.register_new_user(UserCreateDTO(login="admin", sshKey="Blank",isAdmin=True, password="admin"))
        except UserAlreadyExists:
            print("Skipping pre-init...")
        conn.commit()
    uvicorn.run(init())

if __name__ == "__main__":
    startapp()