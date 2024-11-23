import datetime
import json
import os
from sqlite3 import Cursor, IntegrityError
import subprocess
from typing import Optional

from common.exceptions import EntityNotFound
from desktops.exceptions import AlreadyReserved, InvalidReservation
from desktops.infra.dto.desktops import DesktopCreateDTO, DesktopReadDTO, DesktopType
from desktops.infra.dto.reservation import ReservationDTO, check_reservation
from desktops.infra.sql_queries import (
    CREATE_NEW_DESKTOP,
    DELETE_RESERVATION,
    GET_DESKTOP_BY_NAME,
    GET_DESKTOPS,
    GET_RESERVATIONS,
    GET_RESERVATIONS_ON_DESKTOP,
    SET_RESERVATION,
)
from users.infra.exceptions import DesktopAlreadyExists


class DesktopRepo:
    def __init__(self, cursor=Cursor):
        self.__cursor = cursor

    def create_new_desktop(self, desktop: DesktopCreateDTO):
        try:
            self.__cursor.execute(
                CREATE_NEW_DESKTOP,
                (desktop.name, desktop.ip, desktop.port, desktop.type.value),
            )
            self.__cursor.connection.commit()
        except IntegrityError as e:
            if "UNIQUE" in str(e):
                raise DesktopAlreadyExists(desktop.name)

    def get_desktop_by_name(self, name: str) -> Optional[DesktopReadDTO]:
        self.__cursor.execute(GET_DESKTOP_BY_NAME, (name,))
        res = self.__cursor.fetchone()
        return DesktopReadDTO(**res) if res else None

    def get(self):
        self.__cursor.execute(GET_DESKTOPS)
        return list(map(lambda row: DesktopReadDTO(**row), self.__cursor.fetchall()))

    def check_reserved(self, id: int, _from, until) -> bool:
        self.__cursor.execute(GET_RESERVATIONS_ON_DESKTOP, (id,))
        res = self.__cursor.fetchall()

        for row in res:
            reserv = ReservationDTO(**row)
            if check_reservation(reserv, datetime.datetime.fromisoformat(until).timestamp()) or check_reservation(reserv, datetime.datetime.fromisoformat(_from).timestamp()):
                return True
        
        return False

    def reserve(self, name: str, _from: str, until: str, by: int):
        desktop = self.get_desktop_by_name(name)
        if not desktop:
            raise EntityNotFound(name)

        reserved = self.check_reserved(desktop.id, _from, until)
        if datetime.datetime.now().timestamp() > datetime.datetime.fromisoformat(until).timestamp():
            raise InvalidReservation
        print(reserved)
        if reserved:
            raise AlreadyReserved(name)


        

        self.__cursor.execute(SET_RESERVATION, (_from, until, by, desktop.id))
        self.__cursor.connection.commit()

    def get_reservations(self) -> list[ReservationDTO]:
        self.__cursor.execute(GET_RESERVATIONS)
        return list(self.__cursor.fetchall())
    
    def get_reservations_on_desktop(self) -> list[ReservationDTO]:
        self.__cursor.execute(GET_RESERVATIONS_ON_DESKTOP)
        return list(self.__cursor.fetchall())

    def delete_reservation(self, id):
        self.__cursor.execute(DELETE_RESERVATION, (id,))
        self.__cursor.connection.commit()


    def get_multipass_vm(self):
        try:
            res = subprocess.check_output(['multipass', 'list', '--format', 'json'])
            json.loads(res)
        except:
            return None
        ls = res["list"]
        for obj in ls:
            vm = DesktopCreateDTO(name=obj["name"], ip=obj["ipv4"][0], type=DesktopType.VM)
            try:
                self.create_new_desktop(vm)
            except DesktopAlreadyExists:
                pass

        return res
