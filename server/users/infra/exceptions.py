class UserAlreadyExists(Exception):
    def __init__(self, name):
        self.name = name

    @property
    def message(self):
        return f"{self.name} already exists"


class DesktopAlreadyExists(Exception):
    def __init__(self, name):
        self.name = name

    @property
    def message(self):
        return f"{self.name} already exists"


class NotAdmin(Exception):
    def __init__(self):
        pass

    @property
    def message(self):
        return f"Unauthorized access: Not an admin"


class NotAuthorized(Exception):
    def __init__(self):
        pass

    @property
    def message(self):
        return f"Unauthorized access: Not authorized"
