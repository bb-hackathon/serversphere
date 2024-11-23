from sqlite3 import Connection, Cursor, IntegrityError
from typing import Optional

from users.infra.dto.user import UserAuthDTO, UserCreateDTO, UserReadDTO, check_password, hash_password
from users.infra.exceptions import UserAlreadyExists
from users.infra.sql_queries import CREATE_NEW_USER, GET_USER_BY_ID, GET_USER_BY_LOGIN, REVERT_ADMIN


class UserRepo:
    def __init__(self, cursor: Cursor):
        self.__cursor = cursor

    def register_new_user(self, user: UserCreateDTO):
        try:
            user.password = hash_password(user.password)
            self.__cursor.execute(CREATE_NEW_USER, (user.login, user.password, user.sshKey))
            self.__cursor.connection.commit()
        except IntegrityError as e:
            if "UNIQUE" in str(e):
                raise UserAlreadyExists(user.login)
    
    def get_user_by_id(self, id: int) -> UserReadDTO:
        self.__cursor.execute(GET_USER_BY_ID, id)

        return UserReadDTO(**self.__cursor.fetchone())
    def get_user_by_login(self, login: str) -> UserAuthDTO:
        self.__cursor.execute(GET_USER_BY_LOGIN, (login,))
        return UserAuthDTO(**self.__cursor.fetchone())
    def validate_user(self, login: str, passw: str) -> Optional[int]:
        user = self.get_user_by_login(login)
        if not check_password(user.password, passw):
            return None
        return user.id if user else None
    

    def invert_admin(self, login: str):
        user = self.get_user_by_login(login)
        is_admin = user.isAdmin
        self.__cursor.execute(REVERT_ADMIN, (not is_admin, login))
        self.__cursor.connection.commit()
