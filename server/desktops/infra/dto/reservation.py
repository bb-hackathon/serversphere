import datetime
from common.dto.entity import BaseEntity


class ReservationDTO(BaseEntity):
    reservedFrom: str
    reservedUntil: str
    reservedBy: int
    reservedDesktop: int


class ReservationTimeDTO(BaseEntity):
    reservedFrom: str
    reservedUntil: str


def check_reservation(reservation: ReservationDTO, timestamp):
    return (
        datetime.datetime.fromisoformat(reservation.reservedFrom).timestamp()
        <= timestamp
        <= datetime.datetime.fromisoformat(reservation.reservedUntil).timestamp()
    )
