from sqlite3 import Connection, Cursor, IntegrityError
from typing import Optional

from users.infra.dto.user import (
    UserAuthDTO,
    UserCreateDTO,
    UserReadDTO,
    check_password,
    hash_password,
)
from users.infra.exceptions import UserAlreadyExists
from users.infra.sql_queries import (
    CREATE_NEW_USER,
    GET_USER_BY_ID,
    GET_USER_BY_LOGIN,
    GET_USERS,
    REVERT_ADMIN,
)


class UserRepo:
    def __init__(self, cursor: Cursor):
        self.__cursor = cursor

    def register_new_user(self, user: UserCreateDTO):
        try:
            user.password = hash_password(user.password)
            self.__cursor.execute(
                CREATE_NEW_USER, (user.login, user.password, user.sshKey)
            )
            self.__cursor.connection.commit()
        except IntegrityError as e:
            if "UNIQUE" in str(e):
                raise UserAlreadyExists(user.login)

    def get_user_by_id(self, id: int) -> Optional[UserReadDTO]:
        self.__cursor.execute(GET_USER_BY_ID, id)
        res = self.__cursor.fetchone()
        return UserReadDTO(**res) if res else None

    def get_user_by_login(self, login: str) -> Optional[UserAuthDTO]:
        self.__cursor.execute(GET_USER_BY_LOGIN, (login,))
        res = self.__cursor.fetchone()
        return UserAuthDTO(**res) if res else None

    def validate_user(self, login: str, passw: str) -> Optional[int]:
        user = self.get_user_by_login(login)
        if not user:
            return None
        if not check_password(user.password, passw):
            return None
        return user.id if user else None

    def invert_admin(self, login: str):
        user = self.get_user_by_login(login)
        if not user:
            return None
        is_admin = user.isAdmin
        self.__cursor.execute(REVERT_ADMIN, (not is_admin, login))
        self.__cursor.connection.commit()

    def get_users(self) -> list[UserReadDTO]:
        self.__cursor.execute(GET_USERS)
        res = self.__cursor.fetchall()
        return list(map(lambda row: UserReadDTO(**row), res))
