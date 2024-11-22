from sqlite3 import Connection, Cursor, IntegrityError
from typing import Optional

from users.infra.dto.user import UserAuthDTO, UserReadDTO, check_password, hash_password
from users.infra.exceptions import UserAlreadyExists
from users.infra.sql_queries import CREATE_NEW_USER, GET_USER_BY_ID, GET_USER_BY_LOGIN


class UserRepo:
    def __init__(self, cursor: Cursor):
        self.__cursor = cursor

    def register_new_user(self, user: UserAuthDTO):
        try:
            user.password = hash_password(user.password)
            self.__cursor.execute(CREATE_NEW_USER, (user.login, user.password, user.isAdmin))
            self.__cursor.connection.commit()
        except IntegrityError:
            raise UserAlreadyExists(user.login)
    
    def get_user_by_id(self, id: int) -> UserReadDTO:
        self.__cursor.execute(GET_USER_BY_ID, id)

        return UserReadDTO(**self.__cursor.fetchone())

    def validate_user(self, login: str, passw: str) -> Optional[int]:
        self.__cursor.execute(GET_USER_BY_LOGIN, (login,))
        res = self.__cursor.fetchone()
        print(dict(res))
        if not check_password(res['password'], passw):
            return None
        return res["id"] if res else None

