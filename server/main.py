from sqlite3 import connect
from fastapi import FastAPI
import uvicorn
from desktops.infra import task
from desktops.pres.desktops import desktop_router
from users.infra.dto.user import UserCreateDTO, hash_password
from users.infra.exceptions import UserAlreadyExists
from users.infra.sql_queries import CREATE_NEW_USER
from users.infra.user_repo import UserRepo
from users.rest.exc_handling import handlers
from users.rest.users import user_router
from users.rest.admin import admin_router
from db import (
    CREATE_TABLE_DESKTOPS,
    CREATE_TABLE_RESERVATION,
    CREATE_TABLE_USERS,
    INIT_ADMIN,
)
from fastapi.middleware.cors import CORSMiddleware
from apscheduler.schedulers.background import BackgroundScheduler


def init():
    app = FastAPI()
    app.include_router(user_router)
    app.include_router(admin_router)
    app.include_router(desktop_router)
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://127.0.0.1:8001"],
        allow_credentials=True,
        allow_methods=[
            "GET",
            "POST",
            "OPTIONS",
        ],  # include additional methods as per the application demand
        allow_headers=[
            "Content-Type",
            "Set-Cookie",
        ],  # include additional headers as per the application demand
    )
    handlers(app)
    return app


def startapp():
    with connect("db.sqlite") as conn:
        conn.execute(CREATE_TABLE_USERS)
        conn.execute(CREATE_TABLE_DESKTOPS)
        conn.execute(CREATE_TABLE_RESERVATION)
        try:
            conn.execute(INIT_ADMIN, ("admin", hash_password("admin"), 1, "Blank"))
        except:
            print("skipping init...")
        conn.commit()
        conn.commit()
    app = init()
    scheduler = BackgroundScheduler()
    scheduler.add_job(task.check_for_reservations, "interval", seconds=3)
    scheduler.start()
    uvicorn.run(init(), host="127.0.0.1", port=8000)
    scheduler.shutdown()


if __name__ == "__main__":
    startapp()
