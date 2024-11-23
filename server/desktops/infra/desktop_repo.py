from sqlite3 import Cursor, IntegrityError

from desktops.infra.dto.desktops import DesktopCreateDTO
from desktops.infra.sql_queries import CREATE_NEW_DESKTOP
from users.infra.exceptions import DesktopAlreadyExists


class DesktopRepo:
    def __init__(self, cursor = Cursor):
        self.__cursor = cursor

    def create_new_desktop(self, desktop:DesktopCreateDTO):
        try:
            self.__cursor.execute(CREATE_NEW_DESKTOP, (desktop.name, desktop.ip, desktop.port, desktop.type.value))
            self.__cursor.connection.commit()
        except IntegrityError as e:
            if "UNIQUE" in str(e):
                raise DesktopAlreadyExists(desktop.name)