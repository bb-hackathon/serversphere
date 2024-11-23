from enum import Enum
from typing import Optional

from pydantic import BaseModel

from common.dto.entity import BaseEntity


class DesktopType(Enum):
    VM = "Vm"
    Hard = "Hard"
    Cloud = "Cloud"


class BaseDesktop(BaseModel):
    name: str
    ip: str
    port: int = 8000
    type: DesktopType


class DesktopReadDTO(BaseDesktop, BaseEntity):
    pass


class DesktopCreateDTO(BaseDesktop):
    pass
