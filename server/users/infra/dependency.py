from sqlite3 import Connection, connect
import sqlite3

from fastapi import Request

from users.infra.exceptions import NotAuthorized
from users.rest.tokens import detokenize

def get_cursor():
    with connect('db.sqlite') as conn:
        cur = conn.cursor()
        cur.row_factory = sqlite3.Row
        yield cur
        cur.close()


def get_user_id(request: Request):
    cookie = request.cookies.get('user')
    if not cookie:
        raise NotAuthorized
    user_id = detokenize(cookie) 
    if not user_id:
        raise NotAuthorized
    return user_id
