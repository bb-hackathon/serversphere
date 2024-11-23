class AlreadyReserved(Exception):
    def __init__(self, name):
        self.name = name

    @property
    def message(self):
        return f"{self.name} already reserved"


class InvalidReservation(Exception):
    def __init__(self):
        pass

    @property
    def message(self):
        return f"Can not reserve in the past"


class VmIsDead(Exception):
    def __init__(self, name):
        self.name = name

    @property
    def message(self):
        return f"Desktop {self.name} Is Dead"
