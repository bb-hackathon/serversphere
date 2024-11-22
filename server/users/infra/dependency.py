from sqlite3 import Connection, connect
import sqlite3

from fastapi import Request

def get_cursor():
    with connect('db.sqlite') as conn:
        cur = conn.cursor()
        cur.row_factory = sqlite3.Row
        yield cur
        cur.close()

    