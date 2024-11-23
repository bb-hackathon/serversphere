CREATE_TABLE_USERS = """--sql
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    login TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    isAdmin INTEGER NOT NULL,
    sshKey TEXT NOT NULL
    
)
"""

CREATE_TABLE_DESKTOPS = """--sql
CREATE TABLE IF NOT EXISTS desktops (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    ip TEXT NOT NULL,
    port INTEGER NOT NULL
)
"""

CREATE_TABLE_RESERVATION = """--sql
CREATE TABLE IF NOT EXISTS reservations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    reservedDesktop INTEGER,
    reservedFrom INTEGER,
    reservedUntil INTEGER,
    reservedBy INTEGER,
    FOREIGN KEY(reservedBy) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(reservedDesktop) REFERENCES desktops(id) ON DELETE CASCADE

)

"""

INIT_ADMIN = """--sql
INSERT INTO users(login, password, isAdmin, sshKey) VALUES(?,?,?,?)
"""
