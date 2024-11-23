class EntityNotFound(Exception):
    def __init__(self, identity=None):
        self.identity = identity

    @property
    def message(self):
        return (
            f"Entity not found: {self.identity}"
            if self.identity
            else "Entity not found"
        )
