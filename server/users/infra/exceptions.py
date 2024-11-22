class UserAlreadyExists(Exception):
    def __init__(self, name):
        self.name = name

    @property
    def message(self):
        print(f"{self.name} already exists")