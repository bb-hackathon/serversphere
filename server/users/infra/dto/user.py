from pydantic import BaseModel
from common.dto.entity import BaseEntity
import bcrypt


class BaseUser(BaseModel):
    login: str
    sshKey: str


class UserReadDTO(BaseUser, BaseEntity):
    isAdmin: bool


class UserAuthDTO(BaseUser, BaseEntity):
    password: str
    isAdmin: bool


class UserCreateDTO(BaseUser):
    password: str


def hash_password(password: str):
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    print(hashed)
    return hashed.decode("utf-8")


def check_password(hash: str, password: str):
    print(hash)
    return bcrypt.checkpw(password.encode("utf-8"), hash.encode("utf-8"))
