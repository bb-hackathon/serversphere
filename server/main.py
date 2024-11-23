from sqlite3 import connect
from fastapi import FastAPI
import uvicorn
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
        conn.commit()
    uvicorn.run(init())

if __name__ == "__main__":
    startapp()