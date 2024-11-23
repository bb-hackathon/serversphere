from sqlite3 import Cursor


class DesktopRepo:
    def __init__(self, cursor = Cursor):
        self.cursor = cursor

    